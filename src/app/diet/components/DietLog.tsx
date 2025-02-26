'use client'
import { useState } from 'react'
import { FoodItem } from '../types/FoodItem'
import TextSearch from './Search/TextSearch'
import UPCScanner from './Search/UPCScanner'
import ResultDialog from './Dialogs/ResultDialog'
import AddMealForm from './AddMealForm'

export default function DietLog() {
  const [logEntries, setLogEntries] = useState<FoodItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)

  // ✅ Add Meal to Log
  const handleAddMeal = (meal: FoodItem) => {
    setLogEntries((prev) => [...prev, meal])
    setShowAddForm(false)
  }

  // ✅ Handle Search Results from Text or UPC Search
  const handleSearchResults = (results?: FoodItem[]) => {
    if (!results || results.length === 0) {
      alert('No results found')
      return
    }
  
    if (results.length === 1) {
      setSelectedItem(results[0])
      setShowAddForm(true)
    } else {
      setSearchResults(results)
    }
  }
  

  // ✅ Handle Successful UPC Scan
  const handleUPCScan = async (item: { upc: string }) => {
    let upc = item.upc.trim()
  
    // 🔹 Fix leading zero issue if scanning a UPC-A barcode
    if (upc.length > 12 && upc.startsWith('0')) {
      upc = upc.substring(1)
    }
  
    console.log('📷 Adjusted UPC:', upc)
  
    try {
      const res = await fetch(`/api/upc?upc=${upc}`)
      const data = await res.json()
  
      if (!data || !data.product) {
        alert('No results found for scanned UPC')
        return
      }
  
      console.log('📦 Fetched UPC Data:', data)
  
      // ✅ Map OpenFoodFacts response to FoodItem format
      const mappedFoodItem: FoodItem = {
        id: data.code,
        description: data.product.product_name || 'Unknown Product',
        calories: data.product.nutriments['energy-kcal'] || 0,
        protein: data.product.nutriments.proteins || 0,
        fat: data.product.nutriments.fat || 0,
        carbs: data.product.nutriments.carbohydrates || 0,
        fiber: data.product.nutriments.fiber || 0,
        sugars: data.product.nutriments.sugars || 0,
        sodium: data.product.nutriments.sodium || 0,
        cholesterol: data.product.nutriments.cholesterol || 0,
        source: 'OpenFoodFacts',
      }
  
      setSelectedItem(mappedFoodItem)
      setShowAddForm(true) // ✅ Show form with pre-filled data
    } catch (err) {
      console.error('❌ Error fetching UPC data:', err)
      alert('Failed to fetch product data.')
    } finally {
      setShowScanner(false)
    }
  }
  
  

  // ✅ Handle Scanner Errors
  const handleScannerError = (error: string) => {
    console.error('Scanner Error:', error)
    alert(error)
  }

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Diet Log</h2>

      {/* ✅ Search by Text */}
      <TextSearch onResult={handleSearchResults} />

      {/* ✅ “+” Button to Add Meal */}
      <button
        onClick={() => setShowAddForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded my-4"
      >
        + Add Meal
      </button>

      {/* ✅ Separate "Scan" Button */}
      <button
        onClick={() => setShowScanner(true)}
        className="bg-green-500 text-white px-4 py-2 rounded my-4"
      >
        📷 Scan Barcode
      </button>

      {/* ✅ Show Scanner When Triggered */}
      {showScanner && (
        <UPCScanner
          onScan={handleUPCScan}
          onClose={() => setShowScanner(false)}
          onError={handleScannerError}
        />
      )}

      {/* ✅ Add Meal Form */}
      {showAddForm && (
        <AddMealForm
        initialData={selectedItem ?? undefined} // ✅ Convert `null` to `undefined`
        onSave={handleAddMeal}
        onCancel={() => setShowAddForm(false)}
      />
      )}

      {/* ✅ Show Logged Meals */}
      <h3 className="text-lg font-bold mt-4">Logged Meals:</h3>
      <ul className="space-y-2">
        {logEntries.map((entry) => (
          <li key={entry.id} className="border p-2 rounded">
            <strong>{entry.description}</strong> — {entry.calories} kcal
          </li>
        ))}
      </ul>

      {/* ✅ Dialog for Multiple Search Results */}
      {searchResults.length > 0 && (
        <ResultDialog
          results={searchResults}
          onSelect={(item) => {
            setSelectedItem(item)
            setShowAddForm(true)
            setSearchResults([])
          }}
          onClose={() => setSearchResults([])}
        />
      )}
    </div>
  )
}

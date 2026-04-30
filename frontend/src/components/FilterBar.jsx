import React, { useState } from 'react'

const FilterBar = ({ onFilter }) => {
  const [year, setYear] = useState('')
  const [minRating, setMinRating] = useState('')
  const [language, setLanguage] = useState('')

  const applyFilters = () => {
    onFilter({
      year: year || null,
      min_rating: minRating ? parseFloat(minRating) : null,
      language: language || null
    })
  }

  const resetFilters = () => {
    setYear('')
    setMinRating('')
    setLanguage('')
    onFilter({ year: null, min_rating: null, language: null })
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g., 2023"
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm mb-1">Min Rating</label>
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded">
            <option value="">Any</option>
            <option value="5">5+</option>
            <option value="6">6+</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm mb-1">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded">
            <option value="">Any</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
        <button onClick={applyFilters} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Apply</button>
        <button onClick={resetFilters} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Reset</button>
      </div>
    </div>
  )
}

export default FilterBar
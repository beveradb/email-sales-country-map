import { SalesData } from './DashboardPage'
import './Stats.css'

interface StatsProps {
  salesData: SalesData
}

export default function Stats({ salesData }: StatsProps) {
  const countries = Object.keys(salesData)
  const totalSales = Object.values(salesData).reduce((sum, count) => sum + count, 0)
  
  const sortedCountries = countries
    .map(country => ({ country, sales: salesData[country] }))
    .sort((a, b) => b.sales - a.sales)

  const topCountries = sortedCountries.slice(0, 5)
  const bottomCountries = sortedCountries.slice(-5).reverse()

  const topCountry = sortedCountries[0]
  const leastCountry = sortedCountries[sortedCountries.length - 1]

  return (
    <div className="stats">
      <div className="stats-card">
        <h3>Key Metrics</h3>
        <div className="metrics">
          <div className="metric">
            <span className="metric-value">{totalSales}</span>
            <span className="metric-label">Total Sales</span>
          </div>
          <div className="metric">
            <span className="metric-value">{countries.length}</span>
            <span className="metric-label">Countries</span>
          </div>
          {topCountry && (
            <div className="metric">
              <span className="metric-value">{topCountry.sales}</span>
              <span className="metric-label">Top Country Sales</span>
            </div>
          )}
        </div>
      </div>

      {topCountry && (
        <div className="stats-card">
          <h3>Best Performers</h3>
          <div className="best-worst">
            <div className="best">
              <h4>🏆 Most Sales</h4>
              <div className="country-stat">
                <span className="country-name">{topCountry.country}</span>
                <span className="country-value">{topCountry.sales} sales</span>
              </div>
            </div>
            {leastCountry && topCountry !== leastCountry && (
              <div className="worst">
                <h4>📍 Least Sales</h4>
                <div className="country-stat">
                  <span className="country-name">{leastCountry.country}</span>
                  <span className="country-value">{leastCountry.sales} sales</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {topCountries.length > 0 && (
        <div className="stats-card">
          <h3>Top 5 Countries</h3>
          <div className="leaderboard">
            {topCountries.map((item, index) => (
              <div key={item.country} className="leaderboard-item">
                <span className="rank">#{index + 1}</span>
                <span className="country">{item.country}</span>
                <span className="sales">{item.sales}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {bottomCountries.length > 0 && sortedCountries.length > 5 && (
        <div className="stats-card">
          <h3>Bottom 5 Countries</h3>
          <div className="leaderboard">
            {bottomCountries.map((item, index) => (
              <div key={item.country} className="leaderboard-item">
                <span className="rank">#{sortedCountries.length - index}</span>
                <span className="country">{item.country}</span>
                <span className="sales">{item.sales}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

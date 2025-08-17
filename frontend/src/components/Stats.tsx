import type { SalesData } from './DashboardPage'
import './Stats.css'

interface StatsProps {
  salesData: SalesData
}

export default function Stats({ salesData }: StatsProps) {
  const countries = Object.keys(salesData)
  const totalSales = Object.values(salesData).reduce((sum, data) => sum + data.count, 0)
  
  const sortedCountries = countries
    .map(country => ({ 
      country, 
      sales: salesData[country].count,
      firstSale: salesData[country].firstSale,
      lastSale: salesData[country].lastSale
    }))
    .sort((a, b) => b.sales - a.sales)

  const topCountries = sortedCountries.slice(0, 5)
  const lowestCountries = sortedCountries.slice(-5).reverse()

  // Sort by most recent first sale for "Newest 5 Countries"
  const newestCountries = [...sortedCountries]
    .sort((a, b) => b.firstSale - a.firstSale)
    .slice(0, 5)

  const topCountry = sortedCountries[0]
  const leastCountry = sortedCountries[sortedCountries.length - 1]

  // Total countries in the world (UN recognized countries + some others)
  const totalWorldCountries = 195
  const countriesOutstanding = totalWorldCountries - countries.length

  return (
    <div className="stats">
      {/* Row 1: Key Metrics + Best/Worst Performers */}
      <div className="stats-row-1">
        <div className="stats-card">
          <h3>Key Metrics</h3>
          <div className="metrics-compact">
            <div className="metric">
              <span className="metric-value">{totalSales}</span>
              <span className="metric-label">Total Sales</span>
            </div>
            {topCountry && (
              <div className="metric">
                <span className="metric-value">{topCountry.sales}</span>
                <span className="metric-label">Top Country</span>
              </div>
            )}
            <div className="metric">
              <span className="metric-value">{countries.length}</span>
              <span className="metric-label">Countries</span>
            </div>
            <div className="metric">
              <span className="metric-value">{countriesOutstanding}</span>
              <span className="metric-label">Outstanding</span>
            </div>
          </div>
        </div>

        {topCountry && (
          <div className="stats-card">
            <h3>Best Performers</h3>
            <div className="performers-compact">
              <div className="performer">
                <div className="performer-label">🏆 Most Sales</div>
                <div className="performer-value">
                  <span className="country-name">{topCountry.country}</span>
                  <span className="country-sales">{topCountry.sales} sales</span>
                </div>
              </div>
              {leastCountry && topCountry !== leastCountry && (
                <div className="performer">
                  <div className="performer-label">📍 Least Sales</div>
                  <div className="performer-value">
                    <span className="country-name">{leastCountry.country}</span>
                    <span className="country-sales">{leastCountry.sales} sales</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Top 5, Bottom 5, Newest 5 Countries */}
      <div className="stats-row-2">
        {topCountries.length > 0 && (
          <div className="stats-card">
            <h3>Top 5 Countries</h3>
            <div className="leaderboard-compact">
              {topCountries.map((item, index) => (
                <div key={item.country} className="leaderboard-item-compact">
                  <span className="rank">#{index + 1}</span>
                  <span className="country">{item.country}</span>
                  <span className="sales">{item.sales}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowestCountries.length > 0 && sortedCountries.length > 1 && (
          <div className="stats-card">
            <h3>Bottom {Math.min(5, sortedCountries.length)} Countries</h3>
            <div className="leaderboard-compact">
              {lowestCountries.slice(0, Math.min(5, sortedCountries.length)).map((item, index) => (
                <div key={item.country} className="leaderboard-item-compact">
                  <span className="rank">#{sortedCountries.length - index}</span>
                  <span className="country">{item.country}</span>
                  <span className="sales">{item.sales}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {newestCountries.length > 0 && (
          <div className="stats-card">
            <h3>Newest 5 Countries</h3>
            <div className="leaderboard-compact">
              {newestCountries.map((item, index) => (
                <div key={item.country} className="leaderboard-item-compact">
                  <span className="rank">#{index + 1}</span>
                  <span className="country">{item.country}</span>
                  <span className="sales">{new Date(item.firstSale).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

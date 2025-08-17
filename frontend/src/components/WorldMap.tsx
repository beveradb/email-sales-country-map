import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import type { SalesData } from './DashboardPage'
import './WorldMap.css'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json"

interface WorldMapProps {
  salesData: SalesData
  mode: 'choropleth' | 'dots'
}

export default function WorldMap({ salesData, mode }: WorldMapProps) {
  const salesValues = Object.values(salesData)
  const maxSales = Math.max(...salesValues, 1)
  const minSales = Math.min(...salesValues.filter(v => v > 0), 0)

  // Color scale for choropleth
  const colorScale = scaleLinear<string>()
    .domain([minSales, maxSales])
    .range(['#e8f5e8', '#2d5a2d'])

  // Size scale for dots
  const sizeScale = scaleLinear()
    .domain([minSales, maxSales])
    .range([4, 20])

  // Country name mapping - you might need to expand this based on your data
  const countryNameMap: { [key: string]: string } = {
    'United States': 'USA',
    'United Kingdom': 'GBR',
    'Germany': 'DEU',
    'France': 'FRA',
    'Canada': 'CAN',
    'Australia': 'AUS',
    'Japan': 'JPN',
    'Brazil': 'BRA',
    'India': 'IND',
    'China': 'CHN',
    'Russia': 'RUS',
    'Italy': 'ITA',
    'Spain': 'ESP',
    'Netherlands': 'NLD',
    'Sweden': 'SWE',
    'Norway': 'NOR',
    'Finland': 'FIN',
    'Denmark': 'DNK',
    'Belgium': 'BEL',
    'Switzerland': 'CHE',
    'Austria': 'AUT',
    'Poland': 'POL',
    'Czech Republic': 'CZE',
    'Hungary': 'HUN',
    'Greece': 'GRC',
    'Portugal': 'PRT',
    'Ireland': 'IRL',
    'Mexico': 'MEX',
    'Argentina': 'ARG',
    'Chile': 'CHL',
    'South Africa': 'ZAF',
    'Egypt': 'EGY',
    'Israel': 'ISR',
    'Turkey': 'TUR',
    'South Korea': 'KOR',
    'Thailand': 'THA',
    'Indonesia': 'IDN',
    'Malaysia': 'MYS',
    'Singapore': 'SGP',
    'Philippines': 'PHL',
    'Vietnam': 'VNM',
    'New Zealand': 'NZL',
    'Ukraine': 'UKR',
    'Romania': 'ROU',
    'Bulgaria': 'BGR',
    'Croatia': 'HRV',
    'Slovenia': 'SVN',
    'Slovakia': 'SVK',
    'Lithuania': 'LTU',
    'Latvia': 'LVA',
    'Estonia': 'EST',
  }

  const getSalesForCountry = (countryName: string, countryId: string) => {
    // Try exact match first
    if (salesData[countryName]) return salesData[countryName]
    
    // Try mapped name
    const mappedName = Object.keys(countryNameMap).find(key => 
      countryNameMap[key] === countryId
    )
    if (mappedName && salesData[mappedName]) return salesData[mappedName]
    
    // Try reverse lookup in our sales data
    const matchingKey = Object.keys(salesData).find(key => 
      key.toLowerCase() === countryName.toLowerCase() ||
      countryNameMap[key] === countryId
    )
    
    return matchingKey ? salesData[matchingKey] : 0
  }

  return (
    <div className="world-map">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 140,
          center: [0, 0],
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) => (
            <>
              {geographies.map((geo: any) => {
                const countryName = geo.properties.NAME
                const countryId = geo.properties.ISO_A3
                const sales = getSalesForCountry(countryName, countryId)
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      mode === 'choropleth' && sales > 0
                        ? colorScale(sales)
                        : '#e2e8f0'
                    }
                    stroke="#cbd5e0"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: 'none',
                      },
                      hover: {
                        fill: mode === 'choropleth' && sales > 0 ? colorScale(sales * 1.2) : '#cbd5e0',
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        outline: 'none',
                      },
                    }}
                    title={`${countryName}: ${sales} sales`}
                  />
                )
              })}
            </>
          )}
        </Geographies>
        
        {mode === 'dots' &&
          Object.entries(salesData).map(([country, sales]) => {
            // For simplicity, we'll use some common coordinates
            // In a real app, you'd want a proper country coordinate lookup
            const coordinates = getCountryCoordinates(country)
            if (!coordinates) return null
            
            return (
              <Marker key={country} coordinates={coordinates}>
                <circle
                  r={sizeScale(sales)}
                  fill="#3182ce"
                  fillOpacity={0.7}
                  stroke="#1a365d"
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{`${country}: ${sales} sales`}</title>
                </circle>
              </Marker>
            )
          })
        }
      </ComposableMap>
    </div>
  )
}

// Simple coordinate lookup - in a real app you'd want a comprehensive database
function getCountryCoordinates(country: string): [number, number] | null {
  const coords: { [key: string]: [number, number] } = {
    'United States': [-95, 40],
    'United Kingdom': [-2, 54],
    'Germany': [10, 51],
    'France': [2, 46],
    'Canada': [-106, 56],
    'Australia': [133, -27],
    'Japan': [138, 36],
    'Brazil': [-48, -15],
    'India': [77, 20],
    'China': [104, 35],
    'Russia': [105, 61],
    'Italy': [12, 42],
    'Spain': [-4, 40],
    'Netherlands': [5, 52],
    'Sweden': [18, 60],
    'Norway': [10, 60],
    'Finland': [26, 64],
    'Denmark': [9, 56],
    'Belgium': [4, 50],
    'Switzerland': [8, 47],
    'Austria': [14, 47],
    'Poland': [19, 52],
    'Mexico': [-102, 23],
    'Argentina': [-64, -34],
    'Chile': [-71, -30],
    'South Africa': [22, -30],
    'Egypt': [30, 26],
    'Israel': [35, 31],
    'Turkey': [35, 39],
    'South Korea': [128, 36],
    'Thailand': [100, 15],
    'Indonesia': [113, -0.8],
    'Malaysia': [101, 4],
    'Singapore': [104, 1],
    'Philippines': [121, 13],
    'Vietnam': [108, 14],
    'New Zealand': [174, -41],
  }
  
  return coords[country] || null
}

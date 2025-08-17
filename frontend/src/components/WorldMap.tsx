import { ComposableMap, Geographies, Geography, Marker, type Geography as GeographyType } from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import type { SalesData } from './DashboardPage'
import './WorldMap.css'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json"

export interface VisualizationSettings {
  colorTheme: 'green' | 'blue' | 'purple' | 'orange' | 'red'
  dotStyle: 'circle' | 'emoji'
  dotEmoji: string
  dotSizeMultiplier: number
  cutoffs: {
    low: number
    medium: number
    high: number
    veryHigh: number
  }
  opacity: number
}

interface WorldMapProps {
  salesData: SalesData
  mode: 'choropleth' | 'dots'
  settings: VisualizationSettings
}

interface GeographiesRenderProps {
  geographies: GeographyType[]
}

export default function WorldMap({ salesData, mode, settings }: WorldMapProps) {
  const salesValues = Object.values(salesData).map(data => data.count)
  const maxSales = Math.max(...salesValues, 1)
  const minSales = Math.min(...salesValues.filter(v => v > 0), 0)

  // Debug logging (reduced for production)
  console.log(`WorldMap rendering: ${Object.keys(salesData).length} countries with sales data`)

  // Color themes
  const colorThemes = {
    green: ['#e8f5e8', '#2d5a2d'],
    blue: ['#dbeafe', '#1e3a8a'],
    purple: ['#f3e8ff', '#581c87'],
    orange: ['#fed7aa', '#c2410c'],
    red: ['#fee2e2', '#991b1b']
  }

  // Color scale for choropleth
  const colorScale = scaleLinear<string>()
    .domain([minSales, maxSales])
    .range(colorThemes[settings.colorTheme])

  // Size scale for dots (with multiplier)
  const baseSizeRange = [4, 20]
  const sizeScale = scaleLinear()
    .domain([minSales, maxSales])
    .range([baseSizeRange[0] * settings.dotSizeMultiplier, baseSizeRange[1] * settings.dotSizeMultiplier])

  // Get color based on cutoffs
  const getColorByCutoff = (count: number) => {
    const { low, medium, high, veryHigh } = settings.cutoffs
    
    if (count === 0) return '#f8fafc' // Very light grey for no sales
    
    // Use the actual count value in the color scale, not percentages of maxSales
    if (count >= veryHigh) return colorThemes[settings.colorTheme][1] // darkest
    if (count >= high) return colorScale(count)
    if (count >= medium) return colorScale(count)
    if (count >= low) return colorScale(count)
    return '#f8fafc' // Very light grey for countries with sales but below low threshold
  }

  // Enhanced country name mapping with both directions
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

  // Create reverse mapping from ISO codes to full names
  const reverseCountryMap = Object.fromEntries(
    Object.entries(countryNameMap).map(([name, code]) => [code, name])
  )

  const getSalesForCountry = (countryName: string, countryId: string) => {
    // Ensure we have valid inputs and salesData
    if (!salesData || (!countryName && !countryId)) return 0
    
    // Try exact match first (case-insensitive)
    if (countryName && salesData[countryName]) {
      return salesData[countryName].count
    }
    
    // Try case-insensitive match
    const exactMatch = Object.keys(salesData).find(key => 
      key.toLowerCase() === (countryName || '').toLowerCase()
    )
    if (exactMatch) {
      return salesData[exactMatch].count
    }
    
    // Try mapping from ISO code to name
    if (countryId && reverseCountryMap[countryId]) {
      const mappedName = reverseCountryMap[countryId]
      if (salesData[mappedName]) {
        return salesData[mappedName].count
      }
    }
    
    // Try mapping from name to ISO and check both ways
    if (countryName && countryNameMap[countryName]) {
      const isoCode = countryNameMap[countryName]
      const altName = reverseCountryMap[isoCode]
      if (altName && salesData[altName]) {
        return salesData[altName].count
      }
    }
    
    // Try partial matches
    const partialMatch = Object.keys(salesData).find(key => 
      key && countryName && (
        key.toLowerCase().includes(countryName.toLowerCase()) ||
        countryName.toLowerCase().includes(key.toLowerCase())
      )
    )
    if (partialMatch) {
      return salesData[partialMatch].count
    }
    
    return 0
  }

  return (
    <div className="world-map">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 140,
          center: [0, 0],
        }}
        width={800}
        height={400}
        viewBox="0 0 800 400"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: GeographiesRenderProps) => {
            console.log(`🌐 Choropleth rendering: ${geographies?.length || 0} countries in ${mode} mode`)
            return (
              <>
                {geographies.map((geo: GeographyType) => {
                  const countryName = geo?.properties?.name
                  const countryId = geo?.properties?.iso_a3 || geo?.id
                  const sales = getSalesForCountry(countryName || '', countryId || '')
                  
                  const fillColor = mode === 'choropleth' 
                    ? getColorByCutoff(sales)
                    : '#e2e8f0'
                  
                  return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#cbd5e0"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: 'none',
                        fillOpacity: settings.opacity,
                      },
                      hover: {
                        fill: mode === 'choropleth' 
                          ? getColorByCutoff(sales > 0 ? sales * 1.2 : sales) 
                          : '#cbd5e0',
                        outline: 'none',
                        cursor: 'pointer',
                        fillOpacity: Math.min(settings.opacity + 0.2, 1),
                      },
                      pressed: {
                        outline: 'none',
                        fillOpacity: settings.opacity,
                      },
                    }}
                    title={`${countryName}: ${sales} sales`}
                    />
                  )
                })}
              </>
            )
          }}
        </Geographies>
        
        {mode === 'dots' &&
          Object.entries(salesData).map(([country, data]) => {
            const coordinates = getCountryCoordinates(country)
            if (!coordinates) return null
            
            const size = sizeScale(data.count)
            const color = getColorByCutoff(data.count)
            
            return (
              <Marker key={country} coordinates={coordinates}>
                {settings.dotStyle === 'emoji' ? (
                  <text
                    textAnchor="middle"
                    y={size / 4}
                    fontSize={size}
                    style={{ cursor: 'pointer' }}
                    opacity={settings.opacity}
                  >
                    {settings.dotEmoji}
                    <title>{`${country}: ${data.count} sales`}</title>
                  </text>
                ) : (
                  <circle
                    r={size}
                    fill={color}
                    fillOpacity={settings.opacity}
                    stroke={colorThemes[settings.colorTheme][1]}
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>{`${country}: ${data.count} sales`}</title>
                  </circle>
                )}
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

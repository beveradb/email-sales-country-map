import { ComposableMap, Geographies, Geography, Marker, type Geography as GeographyType } from 'react-simple-maps'
import { useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { geoCentroid } from 'd3-geo'
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
  const [selected, setSelected] = useState<{ name: string; count: number; coordinates: [number, number] } | null>(null)
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

  const sanitizeName = (name: string) =>
    (name || '')
      .replace(/\b(Sincerely|Regards|Best regards|Thank you|Thanks)\b.*$/i, '')
      .replace(/[.;:]+$/g, '')
      .trim()

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
    const primary = sanitizeName(countryName)
    if (primary && salesData[primary]) {
      return salesData[primary].count
    }
    
    // Try case-insensitive match
    const exactMatch = Object.keys(salesData).find(key => 
      key.toLowerCase() === (primary || '').toLowerCase()
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
    if (primary && countryNameMap[primary]) {
      const isoCode = countryNameMap[primary]
      const altName = reverseCountryMap[isoCode]
      if (altName && salesData[altName]) {
        return salesData[altName].count
      }
    }
    
    // Try partial matches
    const partialMatch = Object.keys(salesData).find(key => 
      key && primary && (
        key.toLowerCase().includes(primary.toLowerCase()) ||
        primary.toLowerCase().includes(key.toLowerCase())
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
                  const countryId = geo?.properties?.iso_a3 || String(geo?.id || '')
                  const sales = getSalesForCountry(countryName || '', countryId)
                  const coords = geoCentroid(geo as unknown as { type: string; geometry: { type: string; coordinates: unknown } }) as [number, number]
                  
                  const fillColor = mode === 'choropleth' 
                    ? getColorByCutoff(sales)
                    : sales === 0 ? '#f8fafc' : '#e2e8f0'
                  
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
                          : sales === 0 ? '#e2e8f0' : '#cbd5e0',
                        outline: 'none',
                        cursor: 'pointer',
                        fillOpacity: Math.min(settings.opacity + 0.2, 1),
                      },
                      pressed: {
                        outline: 'none',
                        fillOpacity: settings.opacity,
                      },
                    }}
                    onClick={() => {
                      if (sales > 0) {
                        setSelected({ name: countryName || '', count: sales, coordinates: coords })
                      } else {
                        setSelected(null)
                      }
                    }}
                    title={`${countryName}: ${sales} sales`}
                    />
                  )
                })}
              </>
            )
          }}
        </Geographies>
        
        {mode === 'dots' && (
          <Geographies geography={geoUrl}>
            {({ geographies }: GeographiesRenderProps) => (
              <>
                {geographies.map((geo: GeographyType) => {
                  const countryName = geo?.properties?.name
                  const countryId = geo?.properties?.iso_a3 || String(geo?.id || '')
                  const sales = getSalesForCountry(countryName || '', countryId)
                  if (sales <= 0) return null
                  const coordinates = geoCentroid(geo as unknown as { type: string; geometry: { type: string; coordinates: unknown } }) as [number, number]
                  const size = sizeScale(sales)
                  const color = getColorByCutoff(sales)
                  return (
                    <Marker key={`dot-${geo.rsmKey}`} coordinates={coordinates}>
                      {settings.dotStyle === 'emoji' ? (
                        <text
                          textAnchor="middle"
                          y={size / 4}
                          fontSize={size}
                          style={{ cursor: 'pointer' }}
                          opacity={settings.opacity}
                        >
                          {settings.dotEmoji}
                          <title>{`${countryName}: ${sales} sales`}</title>
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
                          <title>{`${countryName}: ${sales} sales`}</title>
                        </circle>
                      )}
                    </Marker>
                  )
                })}
              </>
            )}
          </Geographies>
        )}

        {selected && (
          <Marker coordinates={selected.coordinates}>
            <g transform="translate(0, -20)" style={{ pointerEvents: 'none' }}>
              <rect x={-60} y={-30} rx={6} ry={6} width={120} height={40} fill="#ffffff" stroke="#94a3b8" strokeWidth={1} opacity={0.95} />
              <text x={0} y={-12} textAnchor="middle" fontSize={12} fill="#0f172a">
                {selected.name}
              </text>
              <text x={0} y={6} textAnchor="middle" fontSize={12} fill="#334155">
                {selected.count} sales
              </text>
            </g>
          </Marker>
        )}
      </ComposableMap>
    </div>
  )
}

// Legacy helper removed; centroids are derived from geographies now

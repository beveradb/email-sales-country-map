declare module 'react-simple-maps' {
  import { ReactElement, ReactNode } from 'react'
  import type React from 'react'

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: {
      scale?: number
      center?: [number, number]
    }
    children?: ReactNode
    width?: number
    height?: number
    viewBox?: string
  }

  export interface GeographiesProps {
    geography: string
    children: (props: { geographies: Geography[] }) => ReactElement
  }

  export interface GeographyProps {
    key?: string
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    title?: string
    onClick?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void
  }

  export interface MarkerProps {
    coordinates: [number, number]
    children?: ReactNode
    key?: string
  }

  export interface Geography {
    rsmKey: string
    properties: {
      name: string
      iso_a3?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }

  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
  export const Marker: React.FC<MarkerProps>
}

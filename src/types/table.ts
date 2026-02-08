export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  slotName?: string
}

export interface FixedSectionButton {
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  icon?: any
  event: string // Event name to emit
  show?: (row: any) => boolean
}

export interface FixedSectionConfig {
  type: 'operation' | 'display'
  label: string
  width?: string | number
  buttons?: FixedSectionButton[]
  contentProp?: string
  slotName?: string
}

export interface TableConfig {
  columns: TableColumn[]
  fixedSection: FixedSectionConfig
}

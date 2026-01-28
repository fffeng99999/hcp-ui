/**
 * 导出工具
 */
export class ExportUtil {
  /**
   * 导出为 CSV
   */
  static exportToCsv(
    data: Record<string, any>[],
    filename: string = 'export.csv'
  ): void {
    if (data.length === 0) return

    const headers = Object.keys(data)
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value
        }).join(',')
      )
    ].join('\n')

    this.downloadFile(csvContent, filename, 'text/csv')
  }

  /**
   * 导出为 JSON
   */
  static exportToJson(
    data: any,
    filename: string = 'export.json'
  ): void {
    const jsonString = JSON.stringify(data, null, 2)
    this.downloadFile(jsonString, filename, 'application/json')
  }

  /**
   * 下载文件
   */
  static downloadFile(
    content: string | Blob,
    filename: string,
    mimeType: string = 'text/plain'
  ): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export default ExportUtil

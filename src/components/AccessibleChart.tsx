import { ReactNode, useState } from 'react'
import { Button } from './ui/button'
import { Table, EyeSlash } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ChartDataRow {
  [key: string]: string | number
}

interface AccessibleChartProps {
  children: ReactNode
  data: ChartDataRow[]
  title: string
  description?: string
  columns: {
    key: string
    label: string
    format?: (value: string | number) => string
  }[]
  className?: string
  ariaLabel?: string
}

export function AccessibleChart({
  children,
  data,
  title,
  description,
  columns,
  className,
  ariaLabel
}: AccessibleChartProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg truncate">{title}</h3>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTable(!showTable)}
          className="gap-1.5 flex-shrink-0"
          aria-label={showTable ? 'Hide data table' : 'Show data table'}
          aria-expanded={showTable}
          aria-controls={`${title.replace(/\s+/g, '-').toLowerCase()}-data-table`}
        >
          {showTable ? (
            <>
              <EyeSlash size={16} />
              <span className="hidden sm:inline">Hide Table</span>
            </>
          ) : (
            <>
              <Table size={16} />
              <span className="hidden sm:inline">Show Table</span>
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showTable ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            id={`${title.replace(/\s+/g, '-').toLowerCase()}-data-table`}
            role="region"
            aria-label={ariaLabel || `${title} data table`}
          >
            <div className="overflow-x-auto rounded-lg border border-border bg-card/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-3 py-2 text-left font-semibold text-foreground"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-3 py-8 text-center text-muted-foreground"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        {columns.map((col) => (
                          <td key={col.key} className="px-3 py-2 text-foreground">
                            {col.format ? col.format(row[col.key]) : row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="img"
            aria-label={ariaLabel || `${title} chart visualization`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: number | string
  loading?: boolean
}

export function StatsCard({ title, value, loading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">
          {loading ? '...' : value}
        </p>
      </CardContent>
    </Card>
  )
}

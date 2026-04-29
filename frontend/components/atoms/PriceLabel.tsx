interface PriceLabelProps {
  price: string | number
  className?: string
}

export function PriceLabel({ price, className }: PriceLabelProps) {
  const amount = Number(price)
  return (
    <span className={className}>
      {amount === 0 ? 'Free' : `₹${amount.toLocaleString('en-IN')}`}
    </span>
  )
}

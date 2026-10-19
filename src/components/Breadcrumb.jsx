export default function Breadcrumb({ page }) {
  if (page === 'Home') return null
  return (
    <div className="erp-breadcrumb" aria-label="Breadcrumb">
      You are in: <span>{page}</span>
    </div>
  )
}

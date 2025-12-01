import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import Card, { CardContent } from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import { ROUTES } from '@/app/paths.js'
import countryApi from '@/features/countries/api.js'
import { withFallback } from '@/shared/utils/img.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'

const MotionSection = motion.section
const COUNTRIES_PER_PAGE = 20

const toArray = (payload) => {
  const base = payload?.data ?? payload ?? []
  if (Array.isArray(base)) return base
  if (Array.isArray(base?.data)) return base.data
  if (Array.isArray(base?.results)) return base.results
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const extractPagination = (payload = {}) => {
  const base =
    payload?.meta?.pagination ||
    payload?.meta ||
    payload?.pagination ||
    payload?.data?.pagination ||
    {}

  const toNumber = (value) => {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : null
  }

  return {
    page: toNumber(base.page),
    totalPages: toNumber(base.totalPages ?? base.total_pages),
    totalItems: toNumber(base.totalItems ?? base.total_items ?? base.total),
  }
}

export default function CountriesPage() {
  const [popularState, setPopularState] = useState({ items: [], loading: true, error: '' })
  const [allCountriesState, setAllCountriesState] = useState({
    items: [],
    loading: true,
    error: '',
    page: 1,
    totalPages: 1,
    totalItems: 0,
  })

  // Fetch popular countries
  useEffect(() => {
    let isActive = true
    setPopularState((prev) => ({ ...prev, loading: true, error: '' }))

    countryApi
      .popular()
      .then((response) => {
        if (!isActive) return
        const items = toArray(response)
        setPopularState({ items, loading: false, error: '' })
      })
      .catch((error) => {
        if (!isActive) return
        setPopularState({ items: [], loading: false, error: getApiErrorMessage(error) })
      })

    return () => {
      isActive = false
    }
  }, [])

  // Fetch all countries with pagination
  useEffect(() => {
    let isActive = true
    setAllCountriesState((prev) => ({ ...prev, loading: true, error: '' }))

    countryApi
      .list({ page: allCountriesState.page, limit: COUNTRIES_PER_PAGE })
      .then((response) => {
        if (!isActive) return
        const items = toArray(response)
        const pagination = extractPagination(response)
        setAllCountriesState((prev) => ({
          ...prev,
          items,
          loading: false,
          error: '',
          totalPages: pagination.totalPages ?? 1,
          totalItems: pagination.totalItems ?? items.length,
        }))
      })
      .catch((error) => {
        if (!isActive) return
        setAllCountriesState((prev) => ({
          ...prev,
          items: [],
          loading: false,
          error: getApiErrorMessage(error),
        }))
      })

    return () => {
      isActive = false
    }
  }, [allCountriesState.page])

  const handlePrevPage = () => {
    if (allCountriesState.page > 1) {
      setAllCountriesState((prev) => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const handleNextPage = () => {
    if (allCountriesState.page < allCountriesState.totalPages) {
      setAllCountriesState((prev) => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const canPrevPage = allCountriesState.page > 1
  const canNextPage = allCountriesState.page < allCountriesState.totalPages

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Explorer</p>
        <h1 className="text-3xl font-bold text-black">Countries</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Browse popular national associations supported by the KickOff Hub API. Click on a country to view its leagues and players.
        </p>
      </header>

      {/* Popular Countries Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Popular Countries</h2>
            <p className="text-sm text-slate-500">Featured football nations with active leagues and players.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            {popularState.items.length} featured
          </span>
        </div>

        {popularState.error && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
            {popularState.error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularState.loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={`popular-skeleton-${index}`} className="border-slate-200 bg-white/70">
                <CardContent>
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}

          {!popularState.loading && !popularState.error && popularState.items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-500">
              No popular countries available yet.
            </p>
          )}

          {popularState.items.map((country) => (
            <Link
              to={`${ROUTES.countries}/${country.id}`}
              key={country.id || country.code || country.name}
              className="group block"
            >
              <Card className="border-slate-200 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  {country.flag ? (
                    <img
                      src={withFallback(country.flag)}
                      alt={country.name}
                      className="h-12 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-20 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                      N/A
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Country</p>
                    <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
                      {country.name || country.country || 'Unnamed country'}
                    </h3>
                    <p className="text-sm text-slate-500">Code: {(country.code || '').toUpperCase() || 'N/A'}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* All Countries Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">All Countries</h2>
            <p className="text-sm text-slate-500">Complete list of all countries in the database.</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
            {allCountriesState.totalItems} total
          </span>
        </div>

        {allCountriesState.error && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
            {allCountriesState.error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allCountriesState.loading &&
            Array.from({ length: 12 }).map((_, index) => (
              <Card key={`all-skeleton-${index}`} className="border-slate-200 bg-white/70">
                <CardContent>
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}

          {!allCountriesState.loading && !allCountriesState.error && allCountriesState.items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-500">
              No countries available yet.
            </p>
          )}

          {!allCountriesState.loading &&
            allCountriesState.items.map((country) => (
              <Link
                to={`${ROUTES.countries}/${country.id}`}
                key={`all-${country.id || country.code || country.name}`}
                className="group block"
              >
                <Card className="border-slate-200 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    {country.flag ? (
                      <img
                        src={withFallback(country.flag)}
                        alt={country.name}
                        className="h-12 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-20 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                        N/A
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Country</p>
                      <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
                        {country.name || country.country || 'Unnamed country'}
                      </h3>
                      <p className="text-sm text-slate-500">Code: {(country.code || '').toUpperCase() || 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>

        {/* Pagination Controls */}
        {allCountriesState.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!canPrevPage || allCountriesState.loading}
            >
              ← Previous
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Page {allCountriesState.page} of {allCountriesState.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!canNextPage || allCountriesState.loading}
            >
              Next →
            </Button>
          </div>
        )}
      </section>
    </MotionSection>
  )
}

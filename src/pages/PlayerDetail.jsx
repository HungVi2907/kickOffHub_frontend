import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../utils/apiClient.js'

const MotionSection = motion.section

export default function PlayerDetail() {
  const { id } = useParams()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get(`/players/${id}`)
        setPlayer(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch player details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPlayer()
    }
  }, [id])

  if (loading) return <p className="text-center text-slate-500">Loading...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (!player) return <p className="text-center text-slate-500">Player not found</p>

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <Link to="/players" className="text-sm text-primary-500 hover:underline">
          ← Back to Players
        </Link>
        <h1 className="text-3xl font-bold text-black">{player.name}</h1>
      </header>

      <div className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-6 md:space-y-0">
          {player.photo && (
            <img src={player.photo} alt={player.name} className="h-32 w-32 rounded-full object-cover" />
          )}
          <div className="space-y-2 text-center md:text-left">
            <p><strong>Name:</strong> {player.name}</p>
            {player.firstname && <p><strong>First Name:</strong> {player.firstname}</p>}
            {player.lastname && <p><strong>Last Name:</strong> {player.lastname}</p>}
            {player.age && <p><strong>Age:</strong> {player.age}</p>}
            {player.birth_date && <p><strong>Birth Date:</strong> {player.birth_date}</p>}
            {player.birth_place && <p><strong>Birth Place:</strong> {player.birth_place}</p>}
            {player.birth_country && <p><strong>Birth Country:</strong> {player.birth_country}</p>}
            <p><strong>Nationality:</strong> {player.nationality}</p>
            {player.height && <p><strong>Height:</strong> {player.height}</p>}
            {player.weight && <p><strong>Weight:</strong> {player.weight}</p>}
            {player.number && <p><strong>Number:</strong> {player.number}</p>}
            <p><strong>Position:</strong> {player.position}</p>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
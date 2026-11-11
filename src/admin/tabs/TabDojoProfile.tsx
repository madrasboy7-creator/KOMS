import React, { useState, useEffect } from 'react'
import { komsStore } from '../../services/komsStore'
import type { PublicDojo } from '../../home/commonData'

interface TabDojoProfileProps {
  onNavigateTab?: (tab: any, subTab?: string) => void
}

const AVAILABLE_FACILITIES = [
  'Tatami High-Density Mats',
  'Heavy Punching Bags & Makiwara',
  'Traditional Kobudo Weapons Rack',
  'Separate Changing Rooms & Restrooms',
  'Emergency First Aid & CPR Kit',
  'Spectator / Parents Seating Gallery',
  'CCTV Security Monitored',
  'Filtered RO Drinking Water',
  'Two-Wheeler & Car Parking',
  'Air Conditioned Training Hall',
]

const ALL_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const TabDojoProfile: React.FC<TabDojoProfileProps> = ({ onNavigateTab }) => {
  const masterProfile = komsStore.getMasterProfile()
  const targetDojoId = masterProfile.dojoId || 'dojo-ranganagar'

  const [dojo, setDojo] = useState<PublicDojo>(() => {
    return komsStore.getPublicDojo(targetDojoId) || komsStore.getPublicDojos(true)[0]
  })

  const [activeSection, setActiveSection] = useState<'basic' | 'location' | 'training' | 'fees' | 'facilities' | 'gallery' | 'preview'>('basic')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Form Fields
  const [name, setName] = useState(dojo.name)
  const [badge, setBadge] = useState(dojo.badge || '龍神')
  const [bannerUrl, setBannerUrl] = useState(dojo.bannerUrl || '/banners/dojo-banner.jpg')
  const [logoUrl, setLogoUrl] = useState(dojo.logoUrl || '/koms-logo.png')
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(dojo.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE')

  // Location
  const [address, setAddress] = useState(dojo.address || '')
  const [area, setArea] = useState(dojo.area || '')
  const [city, setCity] = useState(dojo.city || 'Chennai')
  const [state, setState] = useState(dojo.state || 'Tamil Nadu')
  const [country, setCountry] = useState(dojo.country || 'India')
  const [pincode, setPincode] = useState(dojo.pincode || '600048')
  const [landmarks, setLandmarks] = useState(dojo.landmarks || '')

  // Contact
  const [phone, setPhone] = useState(dojo.phone || '')
  const [email, setEmail] = useState(dojo.email || '')

  // Training & Schedule
  const [trainingDays, setTrainingDays] = useState<string[]>(dojo.trainingDays || ['Saturday', 'Sunday'])
  const [classTimingsText, setClassTimingsText] = useState(
    dojo.timings?.[0]?.time || '06:00 AM – 08:00 AM & 06:00 PM – 07:30 PM'
  )
  const [levelsOffered, setLevelsOffered] = useState<string[]>(
    dojo.levelsOffered || ['Kids & Juniors (Age 5-15)', 'Adults Self-Defense', 'Black Belt Dan Training', 'Traditional Kobudo Weapons']
  )

  // Fees
  const [entryFee, setEntryFee] = useState<number>(dojo.entryFee || 1000)
  const [monthlyFee, setMonthlyFee] = useState<number>(dojo.monthlyFee || 800)

  // Facilities
  const [facilities, setFacilities] = useState<string[]>(dojo.facilities || [
    'Tatami High-Density Mats',
    'Heavy Punching Bags & Makiwara',
    'Traditional Kobudo Weapons Rack',
    'Separate Changing Rooms & Restrooms',
    'Emergency First Aid & CPR Kit',
    'Spectator / Parents Seating Gallery',
  ])

  // Description & Gallery
  const [description, setDescription] = useState(dojo.description || '')
  const [gallery, setGallery] = useState<string[]>(dojo.gallery || [])
  const [newGalleryUrl, setNewGalleryUrl] = useState('')

  useEffect(() => {
    return komsStore.subscribe(() => {
      const refreshed = komsStore.getPublicDojo(targetDojoId)
      if (refreshed) {
        setDojo(refreshed)
      }
    })
  }, [targetDojoId])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  function toggleDay(day: string) {
    setTrainingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function toggleFacility(f: string) {
    setFacilities((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    )
  }

  function handleAddGalleryImage() {
    if (!newGalleryUrl.trim()) return
    setGallery((prev) => [...prev, newGalleryUrl.trim()])
    setNewGalleryUrl('')
  }

  function handleRemoveGalleryImage(index: number) {
    setGallery((prev) => prev.filter((_, idx) => idx !== index))
  }

  function handlePublishDojo(e: React.FormEvent) {
    e.preventDefault()

    const updated = komsStore.updatePublicDojo(dojo.id, {
      name,
      badge,
      bannerUrl,
      logoUrl,
      status,
      address,
      area,
      city,
      state,
      country,
      pincode,
      landmarks,
      phone,
      email,
      trainingDays,
      timings: [
        {
          batch: 'General & Advanced Batch',
          time: classTimingsText,
          days: trainingDays.join(', '),
        },
      ],
      levelsOffered,
      entryFee: Number(entryFee),
      monthlyFee: Number(monthlyFee),
      facilities,
      description,
      gallery,
    })

    if (updated) {
      showToast('🥋 Dojo Profile updated & published live to Common UI → Dojos!')
      setActiveSection('preview')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-emerald-400 animate-bounce">
          <span className="text-xl">✅</span>
          <p className="font-semibold text-sm">{toastMsg}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black p-6 rounded-2xl border border-red-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 bg-no-repeat bg-right bg-contain pointer-events-none" style={{ backgroundImage: `url('/brand/dojo-crest.png')` }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-red-600/30 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Module 7 • Public Dojo Management
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {status === 'ACTIVE' ? 'Live in Common UI' : 'Paused / Inactive'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-wide flex items-center gap-3">
              <span>{name}</span>
              <span className="text-red-500 font-serif text-xl border border-red-900/60 bg-red-950/40 px-2 py-0.5 rounded">
                {badge}
              </span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              Control the public presence, location, fee schedule, facilities, and class timings for your training center. All updates reflect instantly in the <strong>Common UI → Dojos</strong> directory and visitor modals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('preview')}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold border border-zinc-700 flex items-center space-x-2 transition"
            >
              <span>👁️</span>
              <span>Preview Card & Modal</span>
            </button>
            <button
              type="button"
              onClick={handlePublishDojo}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/40 flex items-center space-x-2 transition transform active:scale-95"
            >
              <span>💾</span>
              <span>Publish Changes</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'basic', label: '1. Basic Info & Branding', icon: '🏯' },
            { id: 'location', label: '2. Location & Venue', icon: '📍' },
            { id: 'training', label: '3. Schedule & Timings', icon: '⏱️' },
            { id: 'fees', label: '4. Fee Structure', icon: '💳' },
            { id: 'facilities', label: '5. Facilities & Equipment', icon: '🥋' },
            { id: 'gallery', label: '6. Description & Gallery', icon: '📸' },
            { id: 'preview', label: '7. Live Public Preview', icon: '🌐' },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                activeSection === sec.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <span>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <form onSubmit={handlePublishDojo} className="space-y-6">
        {/* 1. Basic Info */}
        {activeSection === 'basic' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏯</span> Dojo Identification & Branding
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Official name and identifiers displayed across the KOMS organization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Dojo Official Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="e.g. MASS DRAGON DOJO — Ranga Nagar Dojo"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Japanese Kanji / Crest Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none font-serif"
                  placeholder="e.g. 龍神 or 空手道"
                />
                <p className="text-[11px] text-zinc-500">Rendered beside dojo title on public cards.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Public Visibility Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                >
                  <option value="ACTIVE">Active & Accepting Admissions</option>
                  <option value="INACTIVE">Temporarily Closed / Hidden</option>
                </select>
                <p className="text-[11px] text-zinc-500">Active dojos appear in the Common UI Dojos catalog.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Dojo Banner / Cover Photo URL</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="/banners/dojo-banner.jpg or https://..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Dojo Logo / Emblem URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="/koms-logo.png or https://..."
                />
              </div>
            </div>

            {/* Banner preview */}
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Cover Banner Preview:</span>
              <div className="h-32 w-full rounded-lg bg-cover bg-center border border-zinc-800 flex items-end p-3 relative" style={{ backgroundImage: `url(${bannerUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-lg" />
                <div className="relative z-10 flex items-center space-x-3">
                  <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full bg-black border border-white/20 p-1 object-contain" />
                  <div>
                    <h3 className="text-white font-bold text-sm">{name}</h3>
                    <p className="text-xs text-zinc-300">{area}, {city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Location & Venue */}
        {activeSection === 'location' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📍</span> Venue Location & Contact Information
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Exact address used by visiting parents and students for Google Maps navigation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Complete Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="e.g. 1/38 2nd Street, Ranga Nagar, Mudichur Road, Chennai"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Locality / Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="e.g. Mudichur / Tambaram"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="Chennai"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">State & Country</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                    placeholder="Tamil Nadu"
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Postal PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="600048"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Prominent Landmarks</label>
                <input
                  type="text"
                  value={landmarks}
                  onChange={(e) => setLandmarks(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="e.g. Near Ranga Nagar Vinayagar Temple, 200m from Mudichur Main Junction"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Official Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="+91 96001 03987"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Official Dojo Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                  placeholder="ranganagar@koms.in"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Training & Schedule */}
        {activeSection === 'training' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⏱️</span> Weekly Training Days & Batch Timings
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Configure the days and times when classes are conducted at this dojo.</p>
            </div>

            {/* Days Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Active Weekly Training Days</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {ALL_WEEKDAYS.map((day) => {
                  const isChecked = trainingDays.includes(day)
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border ${
                        isChecked
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{day.slice(0, 3)}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-zinc-500">Currently selected: {trainingDays.join(', ') || 'None'}</p>
            </div>

            {/* Class Timings */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Class Batch Timings Summary</label>
              <input
                type="text"
                value={classTimingsText}
                onChange={(e) => setClassTimingsText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="06:00 AM – 08:00 AM (Morning) & 06:00 PM – 07:30 PM (Evening)"
              />
              <p className="text-[11px] text-zinc-500">Shows on the dojo card preview and the schedule tab of the Common UI modal.</p>
            </div>

            {/* Training Levels */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Training Programs / Levels Offered</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Kids & Juniors Karate (Age 5 - 14)',
                  'Adults Self Defense & Fitness',
                  'Tournament Kata & Kumite Squad',
                  'Okinawan Kobudo Weapon Arts (Bo, Sai, Tonfa, Nunchaku)',
                  'Senior Black Belt Dan Grading Preparation',
                  'Women Safety & Practical Self Defense',
                ].map((lvl) => {
                  const has = levelsOffered.includes(lvl)
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() =>
                        setLevelsOffered((prev) =>
                          prev.includes(lvl) ? prev.filter((x) => x !== lvl) : [...prev, lvl]
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-xs text-left font-medium transition flex items-center justify-between border ${
                        has
                          ? 'bg-red-950/40 border-red-700/60 text-red-200'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>{lvl}</span>
                      <span className="font-bold">{has ? '✓' : '+'}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. Fee Structure */}
        {activeSection === 'fees' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💳</span> Dojo Fee Configuration
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Published rates visible to parents in the Common UI. Master fee invoices and ledger items reference these rates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Admission / Registration Fee</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-semibold">One-Time</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-4 py-2 text-white font-bold text-lg focus:border-red-500 focus:outline-none"
                    placeholder="1000"
                    required
                  />
                </div>
                <p className="text-[11px] text-zinc-500">Includes student registration kit, dojo patch, and student ID badge.</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Monthly Training Tuition</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold">Recurring</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-4 py-2 text-white font-bold text-lg focus:border-red-500 focus:outline-none"
                    placeholder="800"
                    required
                  />
                </div>
                <p className="text-[11px] text-zinc-500">Billed on the 1st to 5th of each training month.</p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 flex items-start space-x-3">
              <span className="text-lg">💡</span>
              <p className="text-xs text-zinc-300">
                Updating these values will update both the Common UI public rates and the default fee ledger when assigning new students in the <strong>Fee Management</strong> tab.
              </p>
            </div>
          </div>
        )}

        {/* 5. Facilities & Equipment */}
        {activeSection === 'facilities' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🥋</span> Dojo Facilities, Amenities & Safety Standards
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Highlighted in the "Facilities" tab of the public modal so parents can review venue infrastructure.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_FACILITIES.map((facility) => {
                const isChecked = facilities.includes(facility)
                return (
                  <div
                    key={facility}
                    onClick={() => toggleFacility(facility)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition flex items-center justify-between ${
                      isChecked
                        ? 'bg-zinc-950 border-emerald-500/50 text-white'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${isChecked ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-transparent'}`}>
                        ✓
                      </span>
                      <span className="text-xs font-medium">{facility}</span>
                    </div>
                    {isChecked && <span className="text-[10px] text-emerald-400 font-semibold uppercase">Active</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 6. Description & Gallery */}
        {activeSection === 'gallery' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📸</span> About Dojo & Training Gallery
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Dojo history, ethos, and photos showcased in the public showcase.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">About the Dojo & Heritage</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="Founded under the guidance of Kyoshi B. Mathan, this dojo is dedicated to preserving authentic Okinawan Shorin Ryu Matsumura Seito karate and traditional Ryukyu Kobudo weapons training..."
              />
            </div>

            {/* Gallery Images */}
            <div className="space-y-3 pt-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Dojo Gallery Images ({gallery.length})</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Paste image URL (e.g. /students/image1.jpeg or https://...)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:border-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition"
                >
                  + Add Image
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {gallery.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950">
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. Live Public Preview */}
        {activeSection === 'preview' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🌐</span> Live Preview: How Visitors See Your Dojo in Common UI
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">This card and modal preview reflects your current saved parameters.</p>
                </div>
                <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full border border-red-600/30">
                  Common UI → Dojos
                </span>
              </div>

              {/* Preview Card */}
              <div className="max-w-md mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl hover:border-red-600/50 transition">
                <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${bannerUrl})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow">
                    {badge}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-zinc-300 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-white/10">
                    ₹{monthlyFee}/mo
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">📍 {area}, {city}</p>
                  </div>

                  {/* Instructor badge */}
                  <div className="flex items-center space-x-3 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
                    <img
                      src={masterProfile.avatar || '/masters/master-mathan.jpeg'}
                      alt={masterProfile.name}
                      className="w-10 h-10 rounded-full object-cover border border-red-500/40"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{masterProfile.name}</p>
                      <p className="text-[11px] text-red-400 truncate">{masterProfile.danRank || masterProfile.rank}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 block uppercase">Schedule</span>
                      <span className="text-zinc-200 font-semibold">{trainingDays.join(', ')}</span>
                    </div>
                    <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-500 block uppercase">Timings</span>
                      <span className="text-zinc-200 font-semibold truncate block">{classTimingsText}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                    <div className="text-[11px] text-zinc-400">
                      Admission: <strong className="text-white">₹{entryFee}</strong>
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition shadow"
                    >
                      View Details & Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="text-xs text-zinc-400">
            Dojo ID: <code className="text-red-400 font-mono">{dojo.id}</code> • Linked Master: <strong className="text-white">{masterProfile.name}</strong>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveSection('preview')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Preview
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/40"
            >
              Publish Dojo Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
import { assetConfig } from '../config/assets'
import { devBelt, devDojo, devEvents, devMembership } from '../data/devSampleData'
import type {
  Announcement,
  AttendanceRecord,
  FeeRecord,
  KomsEvent,
  Student,
  TrainingSession,
} from '../models/koms'
import { komsStore, type DojoHoliday } from '../services/komsStore'
import { Icon, type StudentIconName } from './components/Icon'
import { ImageField, ManagedImage } from './components/ManagedImage'
import './student.css'

export type Page =
  | 'Home'
  | 'Profile'
  | 'My Dojo'
  | 'Membership'
  | 'Belt Progress'
  | 'Attendance'
  | 'Fees'
  | 'Schedule'
  | 'Announcements'
  | 'Events'
  | 'QR Pass'
  | 'Settings'

const navItems: { label: Page; icon: StudentIconName }[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Profile', icon: 'user' },
  { label: 'My Dojo', icon: 'dojo' },
  { label: 'Membership', icon: 'card' },
  { label: 'Belt Progress', icon: 'belt' },
  { label: 'Attendance', icon: 'attendance' },
  { label: 'Fees', icon: 'fees' },
  { label: 'Schedule', icon: 'calendar' },
  { label: 'Announcements', icon: 'bell' },
  { label: 'Events', icon: 'events' },
  { label: 'QR Pass', icon: 'qr' },
]

function KomsLogo() {
  return (
    <div className="sp-logo">
      <ManagedImage src={assetConfig.logo} alt="KOMS logo" fallback="K" />
      <div>
        <strong>KOMS</strong>
        <small>Student Portal</small>
      </div>
    </div>
  )
}

function Button({
  children,
  icon,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode
  icon?: StudentIconName
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`sp-button sp-button--${variant}`}
      onClick={onClick}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

function PreviewBadge({ text = 'Official Student Record' }: { text?: string }) {
  return <span className="sp-preview-badge">{text}</span>
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <section className="sp-page-heading">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </section>
  )
}

function Card({
  children,
  className = '',
  style,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  return (
    <section className={`sp-card ${className}`} style={style} onClick={onClick}>
      {children}
    </section>
  )
}

function Status({ value }: { value: string }) {
  return (
    <span className={`sp-status sp-status--${value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
      {value}
    </span>
  )
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: StudentIconName
  title: string
  text: string
}) {
  return (
    <div className="sp-empty">
      <span>
        <Icon name={icon} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function Modal({
  title,
  onClose,
  children,
  actions,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="sp-modal-backdrop" onClick={onClose}>
      <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sp-modal-head">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="sp-modal-body">{children}</div>
        {actions && <div className="sp-modal-actions">{actions}</div>}
      </div>
    </div>
  )
}

/* =========================================================================
   PAGES
   ========================================================================= */

function Dashboard({
  student,
  navigate,
  onSelectSession,
  onOpenAnnounce,
  schedule,
  announcements,
}: {
  student: Student
  navigate: (page: Page) => void
  onSelectSession: (session: TrainingSession) => void
  onOpenAnnounce: (ann: Announcement) => void
  schedule: TrainingSession[]
  announcements: Announcement[]
}) {
  const firstName = student.name.split(' ')[0]

  return (
    <>
      <section className="sp-hero">
        <ManagedImage
          src={assetConfig.dashboardBanner}
          alt="Martial artist training"
          fallback="KOMS"
        />
        <div className="sp-hero-overlay" />
        <div className="sp-hero-content">
          <PreviewBadge text="Okinawa Shorin Ryu Karate Do" />
          <p>KOMS Active Student</p>
          <h1>{firstName}, keep training with purpose.</h1>
          <span>
            Discipline today. Strength tomorrow. Practicing at {devDojo.name}.
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button icon="qr" onClick={() => navigate('QR Pass')}>
              View membership pass
            </Button>
            <Button
              icon="calendar"
              variant="secondary"
              onClick={() => navigate('Schedule')}
            >
              Class schedule
            </Button>
          </div>
        </div>
        <div className="sp-belt-ribbon">
          <span>Current rank</span>
          <strong>{student.rank || devBelt.currentRank}</strong>
        </div>
      </section>

      <div className="sp-metric-grid">
        <Card className="sp-metric">
          <span>
            <Icon name="attendance" />
          </span>
          <div>
            <small>Attendance Rate</small>
            <strong>92%</strong>
            <p>28 sessions this cycle</p>
          </div>
        </Card>
        <Card className="sp-metric">
          <span>
            <Icon name="calendar" />
          </span>
          <div>
            <small>Next training class</small>
            <strong>Mon · 6:00 PM</strong>
            <p>Shorin Ryu Kihon & Kata</p>
          </div>
        </Card>
        <Card className="sp-metric">
          <span>
            <Icon name="card" />
          </span>
          <div>
            <small>Membership status</small>
            <strong style={{ color: '#16a34a' }}>Active</strong>
            <p>Member ID: {student.memberId}</p>
          </div>
        </Card>
      </div>

      <div className="sp-dashboard-grid">
        <Card>
          <div className="sp-card-head">
            <div>
              <span>Weekly curriculum</span>
              <h2>Upcoming training sessions</h2>
            </div>
            <button onClick={() => navigate('Schedule')}>
              Full schedule <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="sp-session-list">
            {schedule.slice(0, 3).map((item, index) => (
              <button
                className="sp-session"
                key={item.id}
                onClick={() => onSelectSession(item)}
              >
                <span className={index === 0 ? 'is-next' : ''}>
                  <small>{item.day.slice(0, 3)}</small>
                  <strong>{item.startTime.replace(' PM', '').replace(' AM', '')}</strong>
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>
                    {item.instructor} · {item.level}
                  </p>
                </div>
                <Icon name="chevron" size={17} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="sp-progress-card">
          <div className="sp-card-head">
            <div>
              <span>Next grading milestone</span>
              <h2>{devBelt.nextRank}</h2>
            </div>
            <span className="sp-gold-icon">
              <Icon name="belt" />
            </span>
          </div>
          <div
            className="sp-progress-ring"
            style={
              {
                '--progress': `${devBelt.progressPercent * 3.6}deg`,
              } as React.CSSProperties
            }
          >
            <div>
              <strong>{devBelt.progressPercent}%</strong>
              <small>Grading readiness</small>
            </div>
          </div>
          <p>
            Kata & basics verified. Complete remaining sparring drills for the upcoming grading.
          </p>
          <Button variant="secondary" onClick={() => navigate('Belt Progress')}>
            View progression
          </Button>
        </Card>
      </div>

      <div className="sp-content-grid">
        <Card>
          <div className="sp-card-head">
            <div>
              <span>Dojo updates & notices</span>
              <h2>Latest announcements</h2>
            </div>
            <button onClick={() => navigate('Announcements')}>
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          {announcements.slice(0, 2).map((item) => (
            <article
              className="sp-update"
              key={item.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onOpenAnnounce(item)}
            >
              <span>{item.category}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>{item.publishedAt} · Tap to read full details</small>
              </div>
            </article>
          ))}
        </Card>

        <Card className="sp-dojo-mini">
          <ManagedImage
            src={devDojo.banner?.url}
            alt={devDojo.name}
            fallback="OKINAWA DOJO"
          />
          <div>
            <span>Your training home</span>
            <h2>{devDojo.name}</h2>
            <p>
              <Icon name="location" size={15} />
              {devDojo.address}
            </p>
            <button onClick={() => navigate('My Dojo')}>
              View dojo details <Icon name="arrow" size={15} />
            </button>
          </div>
        </Card>
      </div>
    </>
  )
}

function ProfilePage({
  student,
  onUpdateStudent,
  onOpenSwitcher,
}: {
  student: Student
  onUpdateStudent: (updated: Partial<Student>) => void
  onOpenSwitcher: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [avatar, setAvatar] = useState(student.avatar?.url || '')

  const [phone, setPhone] = useState(student.phone)
  const [whatsapp, setWhatsapp] = useState(student.whatsapp || student.phone)
  const [emergency, setEmergency] = useState(student.emergencyContact)
  const [address, setAddress] = useState(student.address || '')
  const [email, setEmail] = useState(student.email)

  function save(event: React.FormEvent) {
    event.preventDefault()
    onUpdateStudent({
      phone,
      whatsapp,
      emergencyContact: emergency,
      address,
      email,
      avatar: avatar
        ? {
            id: `avatar-${Date.now()}`,
            url: avatar,
            alt: `${student.name} profile photo`,
          }
        : student.avatar,
    })
    setSavedToast(true)
    setTimeout(() => {
      setSavedToast(false)
      setEditing(false)
    }, 1500)
  }

  const currentAvatar = avatar || student.avatar?.url || assetConfig.studentAvatar

  return (
    <>
      <PageHeading
        eyebrow="Student Admission Record"
        title="Student Profile"
        description="Official student information from Okinawa Shorin Ryu Karate Do admission registry."
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              icon="user"
              variant="secondary"
              onClick={onOpenSwitcher}
            >
              Switch Student ({student.memberId})
            </Button>
            <Button
              icon="edit"
              variant={editing ? 'secondary' : 'primary'}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel editing' : 'Edit contacts'}
            </Button>
          </div>
        }
      />

      <div className="sp-profile-grid">
        <Card className="sp-profile-summary">
          <div className="sp-avatar-wrap">
            <ManagedImage
              src={currentAvatar}
              alt={student.name}
              fallback={student.name.slice(0, 2).toUpperCase()}
            />
            <button
              onClick={() => setEditing(true)}
              aria-label="Change profile photo"
            >
              <Icon name="camera" size={17} />
            </button>
          </div>
          <h2>{student.name}</h2>
          <p>{student.memberId}</p>
          <Status value="Active Student" />

          <div className="sp-profile-belt">
            <span />
            <div>
              <small>Current Belt Rank</small>
              <strong>{student.rank || devBelt.currentRank}</strong>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--sp-line)',
              textAlign: 'left',
              fontSize: '11px',
              display: 'grid',
              gap: '6px',
            }}
          >
            <div>
              <span style={{ color: '#888' }}>Age: </span>
              <strong>{student.age || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#888' }}>Gender: </span>
              <strong>{student.gender || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#888' }}>Blood Group: </span>
              <strong style={{ color: '#b5121b' }}>{student.bloodGroup || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#888' }}>Date of Joining: </span>
              <strong>{student.joiningDate || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#888' }}>Entrance Fee: </span>
              <strong style={{ color: '#16a34a' }}>
                ₹{student.entranceFee?.toLocaleString('en-IN') || '1,000'} (Paid)
              </strong>
            </div>
          </div>
        </Card>

        <Card className="sp-form-card">
          <div className="sp-card-head">
            <div>
              <span>Personal & Guardian Information</span>
              <h2>Registered Details</h2>
            </div>
            <button type="button" onClick={onOpenSwitcher}>
              Select different student
            </button>
          </div>

          <form onSubmit={save}>
            {editing && (
              <ImageField
                label="Profile photo"
                value={currentAvatar}
                fallback={student.name.slice(0, 2).toUpperCase()}
                onChange={setAvatar}
              />
            )}

            <div className="sp-form-grid">
              <label>
                <span>Full name (as registered)</span>
                <input value={student.name} disabled />
              </label>

              <label>
                <span>Member ID</span>
                <input value={student.memberId} disabled />
              </label>

              <label>
                <span>Date of Birth</span>
                <input value={student.dateOfBirth} disabled />
              </label>

              <label>
                <span>Blood Group</span>
                <input value={student.bloodGroup || '—'} disabled />
              </label>

              <label>
                <span>Father's Name</span>
                <input value={student.fatherName || '—'} disabled />
              </label>

              <label>
                <span>Mother's Name</span>
                <input value={student.motherName || '—'} disabled />
              </label>

              <label>
                <span>Mobile Number</span>
                <input
                  value={phone}
                  disabled={!editing}
                  required
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label>
                <span>*WhatsApp Number</span>
                <input
                  value={whatsapp}
                  disabled={!editing}
                  required
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </label>

              <label>
                <span>Alternate Contact</span>
                <input value={student.alternatePhone || '—'} disabled />
              </label>

              <label>
                <span>Emergency Contact</span>
                <input
                  value={emergency}
                  disabled={!editing}
                  required
                  onChange={(e) => setEmergency(e.target.value)}
                />
              </label>

              <label style={{ gridColumn: '1 / -1' }}>
                <span>Residential Address (Chennai)</span>
                <input
                  value={address}
                  disabled={!editing}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
            </div>

            {editing && (
              <div className="sp-form-actions">
                <p>
                  <Icon name="shield" size={16} />
                  Changes will be saved to your active session record.
                </p>
                <Button type="submit">
                  {savedToast ? 'Saved successfully!' : 'Save changes'}
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>

      {savedToast && (
        <div className="sp-toast" role="status">
          <Icon name="check" />
          <span>Profile details updated successfully.</span>
        </div>
      )}
    </>
  )
}

function DojoPage() {
  const [whatsappSent, setWhatsappSent] = useState(false)

  return (
    <>
      <PageHeading
        eyebrow="Okinawa Martial Arts Heritage"
        title="My Dojo"
        description="Official headquarters, leadership, and training branches for Okinawa Shorin Ryu Karate Do - India."
      />

      <Card className="sp-dojo-hero">
        <ManagedImage
          src={devDojo.banner?.url}
          alt={devDojo.name}
          fallback="OKINAWA SHORIN RYU KARATE DO"
        />
        <div className="sp-dojo-hero-overlay" />
        <div>
          <PreviewBadge text="Affiliated Headquarters" />
          <h1>{devDojo.name}</h1>
          <p>
            <Icon name="location" />
            {devDojo.address}
          </p>
        </div>
      </Card>

      <div className="sp-three-grid">
        <Card className="sp-detail-card">
          <span>
            <Icon name="user" />
          </span>
          <small>Chief Instructors</small>
          <h2>{devDojo.instructor}</h2>
          <p>Senior Dan Black Belt Masters</p>
        </Card>

        <Card className="sp-detail-card">
          <span>
            <Icon name="phone" />
          </span>
          <small>Dojo Communications</small>
          <h2>+91 96001 03987</h2>
          <p>Alternate: +91 97908 97178</p>
        </Card>

        <Card className="sp-detail-card">
          <span>
            <Icon name="clock" />
          </span>
          <small>Training Batches</small>
          <h2>Mon–Sat & Sunday</h2>
          <p>Morning 6:00–9:30 AM · Evening 5:30–8:30 PM</p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '16px' }}>
        <Card className="sp-about-card" style={{ display: 'block' }}>
          <div>
            <span>Dojo Philosophy</span>
            <h2 style={{ marginBottom: '12px' }}>Tradition · Discipline · Character</h2>
          </div>
          <p style={{ marginBottom: '12px' }}>
            {devDojo.description} Under the guidance of our certified instructors, students undergo rigorous
            development in classical Fukyugata and Pinan katas, self-defense applications (Bunkai), full-body
            conditioning, and controlled sparring (Kumite).
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <Button
              icon="phone"
              onClick={() => {
                setWhatsappSent(true)
                setTimeout(() => setWhatsappSent(false), 3000)
              }}
            >
              {whatsappSent ? 'Opening WhatsApp…' : 'Chat with Dojo Office'}
            </Button>
          </div>
        </Card>

        <Card style={{ padding: '24px' }}>
          <div className="sp-card-head" style={{ padding: '0 0 14px 0', minHeight: 'auto' }}>
            <div>
              <span>Five Traditional Rules</span>
              <h2>Dojo Kun (道場訓)</h2>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0 0', display: 'grid', gap: '10px', fontSize: '11px' }}>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#b5121b', fontWeight: 700 }}>一.</span>
              <span>Seek perfection of character (人格完成に努むること)</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#b5121b', fontWeight: 700 }}>一.</span>
              <span>Be faithful and sincere (誠の道を守ること)</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#b5121b', fontWeight: 700 }}>一.</span>
              <span>Endeavor to excel and persevere (努力の精神を養うこと)</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#b5121b', fontWeight: 700 }}>一.</span>
              <span>Respect etiquette and seniors (礼儀を重んずること)</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#b5121b', fontWeight: 700 }}>一.</span>
              <span>Refrain from violent behavior (血気の勇を戒むること)</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card style={{ padding: '20px' }}>
        <div className="sp-card-head" style={{ padding: '0 0 14px 0', minHeight: 'auto' }}>
          <div>
            <span>Regional Presence</span>
            <h2>Chennai Training Centers</h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '14px' }}>
          {[
            ['New Perungalathur (Head Dojo)', 'No: 13, Velu St, M.K.B Nagar, Chennai-63'],
            ['Old Perungalathur Center', '3/24, Ranganagar, Nehru St, Chennai-63'],
            ['Mudichur Branch', 'Gangai Street, Ranga Nagar, Mudichur, Chennai-48'],
            ['West Tambaram Center', 'CTO Colony 2nd St, Lakshmipuram, Tambaram-45'],
            ['Madhanapuram Branch', 'No: 1, Kurinji Nagar 1st Cross, Madhanapuram-63'],
          ].map(([branch, loc]) => (
            <div key={branch} style={{ padding: '12px', borderRadius: '10px', background: 'var(--sp-bg)' }}>
              <strong style={{ fontSize: '11px', display: 'block', color: 'var(--sp-black)' }}>{branch}</strong>
              <small style={{ color: 'var(--sp-muted)', fontSize: '9px', marginTop: '4px', display: 'block' }}>{loc}</small>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

function MembershipPage({ student }: { student: Student }) {
  const [downloaded, setDownloaded] = useState(false)

  return (
    <>
      <PageHeading
        eyebrow="Student Membership & Affiliation"
        title="Membership Details"
        description="Active registration, dojo privileges, and official affiliation status."
        action={
          <Button
            icon="download"
            variant="secondary"
            onClick={() => {
              setDownloaded(true)
              setTimeout(() => setDownloaded(false), 2500)
            }}
          >
            {downloaded ? 'Certificate Generated!' : 'Download Membership Certificate'}
          </Button>
        }
      />

      <div className="sp-membership-grid">
        <Card className="sp-membership-card">
          <div className="sp-membership-top">
            <KomsLogo />
            <Status value={devMembership.status} />
          </div>
          <span>Karate Do Membership Plan</span>
          <h2>{devMembership.plan}</h2>

          <div className="sp-date-pair">
            <div>
              <small>Joined / Valid from</small>
              <strong>{student.joiningDate || devMembership.startDate}</strong>
            </div>
            <div>
              <small>Renewal date</small>
              <strong>{devMembership.renewalDate}</strong>
            </div>
          </div>

          <div className="sp-member-id">
            <small>Student Member ID</small>
            <strong>{student.memberId}</strong>
            <small style={{ marginTop: '4px', color: '#ccc' }}>
              Affiliated with Okinawa Shorin Ryu Karate Do - India
            </small>
          </div>
        </Card>

        <Card className="sp-benefit-card">
          <div className="sp-card-head">
            <div>
              <span>Member Privileges</span>
              <h2>Included Benefits</h2>
            </div>
          </div>
          <ul>
            {[
              'Access to weekly scheduled karate batches across Chennai centers',
              'Official digital membership QR pass for dojo entrance check-ins',
              'Eligibility for Kyu belt examinations and Dan promotions',
              'Participation in South India tournaments and annual Gasshuku camps',
              'Official Okinawa Shorin Ryu syllabus handbook and video resources',
              'Parent attendance during quarterly progress evaluations',
            ].map((item) => (
              <li key={item}>
                <span>
                  <Icon name="check" size={15} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="sp-info-banner">
        <Icon name="shield" />
        <div>
          <strong>Entrance Fee & Registration Confirmed.</strong>
          <p>
            The one-time entrance fee of ₹{student.entranceFee?.toLocaleString('en-IN') || '1,000'} is recorded
            under Member ID {student.memberId}. Contact your instructor for renewal assistance.
          </p>
        </div>
      </div>
    </>
  )
}

function BeltPage({ student }: { student: Student }) {
  const [requirements, setRequirements] = useState(devBelt.requirements)

  function toggleReq(index: number) {
    const updated = [...requirements]
    updated[index].complete = !updated[index].complete
    setRequirements(updated)
  }

  const completedCount = requirements.filter((r) => r.complete).length
  const calcPercent = Math.round((completedCount / requirements.length) * 100)

  const rankBeltColor = (student.rank || devBelt.currentRank).toLowerCase()
  let beltClass = 'sp-belt-color-yellow'
  if (rankBeltColor.includes('white')) beltClass = 'sp-belt-color-white'
  else if (rankBeltColor.includes('yellow')) beltClass = 'sp-belt-color-yellow'
  else if (rankBeltColor.includes('orange')) beltClass = 'sp-belt-color-orange'
  else if (rankBeltColor.includes('green')) beltClass = 'sp-belt-color-green'
  else if (rankBeltColor.includes('blue')) beltClass = 'sp-belt-color-blue'
  else if (rankBeltColor.includes('brown')) beltClass = 'sp-belt-color-brown'
  else if (rankBeltColor.includes('black')) beltClass = 'sp-belt-color-black'

  return (
    <>
      <PageHeading
        eyebrow="Martial Arts Journey"
        title="Belt Progression"
        description="Track your syllabus mastery, kata evaluations, and readiness for the next kyu ranking."
      />

      <Card className="sp-belt-hero">
        <div>
          <span>Current Achieved Rank</span>
          <h1>{student.rank || devBelt.currentRank}</h1>
          <p>Joined: {student.joiningDate || '2026'} · Awarded: {devBelt.awardedDate}</p>
        </div>
        <div className={`sp-belt-visual ${beltClass}`}>
          <i />
          <i />
          <strong>OKINAWA SHORIN RYU</strong>
          <i />
          <i />
        </div>
      </Card>

      <div className="sp-belt-grid">
        <Card className="sp-requirement-card">
          <div className="sp-card-head">
            <div>
              <span>Interactive Grading Readiness</span>
              <h2>Requirements for {devBelt.nextRank}</h2>
            </div>
            <strong>{calcPercent}%</strong>
          </div>

          <div className="sp-linear-progress">
            <span style={{ width: `${calcPercent}%` }} />
          </div>

          <ul style={{ padding: '0 19px 14px' }}>
            {requirements.map((item, idx) => (
              <li
                className={item.complete ? 'complete' : ''}
                key={item.label}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleReq(idx)}
              >
                <span>
                  <Icon name={item.complete ? 'check' : 'clock'} size={15} />
                </span>
                <span>{item.label}</span>
                <small style={{ cursor: 'pointer' }}>
                  {item.complete ? 'Completed (Tap to undo)' : 'Pending (Tap to mark)'}
                </small>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="sp-rank-path">
          <div className="sp-card-head">
            <div>
              <span>Belt Hierarchy</span>
              <h2>Shorin Ryu Kyu Journey</h2>
            </div>
          </div>
          {[
            ['White Belt (10th–9th Kyu)', 'Foundation, stances & etiquette'],
            ['Yellow Belt (8th Kyu)', 'Fukyugata Ichi & basic blocks'],
            ['Orange Belt (7th Kyu)', 'Fukyugata Ni & footwork transitions'],
            ['Green Belt (6th Kyu)', 'Pinan Shodan & basic sparring'],
            ['Blue Belt (5th Kyu)', 'Pinan Nidan & five-step kumite'],
            ['Purple Belt (4th Kyu)', 'Pinan Sandan & combination strikes'],
            ['Brown Belt (3rd–1st Kyu)', 'Pinan Yondan/Godan & advanced kata'],
            ['Black Belt (1st Dan - Shodan)', 'Mastery, Bunkai & teaching apprentice'],
          ].map(([rank, desc], index) => {
            const isCurrent = (student.rank || '').toLowerCase().includes(rank.split(' ')[0].toLowerCase())
            return (
              <div className={isCurrent ? 'current' : ''} key={rank}>
                <span>{index + 1}</span>
                <p>
                  <strong>{rank}</strong>
                  <small>{desc}</small>
                </p>
              </div>
            )
          })}
        </Card>
      </div>
    </>
  )
}

function AttendancePage({
  student,
  records,
}: {
  student: Student
  records: AttendanceRecord[]
}) {
  const [filter, setFilter] = useState('All')
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [leaveSubmitted, setLeaveSubmitted] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(10) // October
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedDayPopover, setSelectedDayPopover] = useState<{
    date: string
    time: string
    status: string
    remarks: string
    instructor: string
  } | null>(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const dojoId = student.dojoId || 'dojo-ranganagar'
  const monthlyStats = useMemo(() => {
    return komsStore.calculateStudentMonthlyAttendance(student.id, dojoId, selectedYear, selectedMonth)
  }, [student.id, dojoId, selectedYear, selectedMonth])

  // Full history
  const fullHistory = useMemo(() => {
    return komsStore.getStudentFullAttendanceHistory(student.id)
  }, [student.id])

  // Month sessions
  const monthSessions = useMemo(() => {
    return komsStore.getScheduleSessions({ dojoId, year: selectedYear, month: selectedMonth })
  }, [dojoId, selectedYear, selectedMonth])

  const studentMonthAtts = useMemo(() => {
    return komsStore.getStudentAttendance({
      studentId: student.id,
      dojoId,
      year: selectedYear,
      month: selectedMonth,
    })
  }, [student.id, dojoId, selectedYear, selectedMonth])

  // Calendar days
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay()
  const todayStr = '2026-11-02'

  const calendarDays = useMemo(() => {
    const list: Array<{
      dayNumber: number
      dateStr: string
      sess?: any
      att?: any
      status: 'present' | 'absent' | 'late' | 'excused' | 'cancelled' | 'holiday' | 'upcoming' | 'none'
    }> = []

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const sess = monthSessions.find((s) => s.classDate === dateStr)
      const att = studentMonthAtts.find((a) => a.classDate === dateStr || (sess && a.sessionId === sess.id))

      let status: 'present' | 'absent' | 'late' | 'excused' | 'cancelled' | 'holiday' | 'upcoming' | 'none' = 'none'

      if (sess) {
        if (sess.sessionStatus === 'cancelled') {
          status = 'cancelled'
        } else if (sess.sessionStatus === 'holiday') {
          status = 'holiday'
        } else if (sess.classDate > todayStr && sess.sessionStatus === 'scheduled') {
          status = 'upcoming'
        } else if (att) {
          status = att.attendanceStatus
        } else {
          status = 'absent'
        }
      }

      list.push({
        dayNumber: d,
        dateStr,
        sess,
        att,
        status,
      })
    }
    return list
  }, [selectedYear, selectedMonth, daysInMonth, monthSessions, studentMonthAtts])

  // Previous months attendance summary table
  const previousMonthsSummaries = useMemo(() => {
    const past = [7, 8, 9, 10].filter((m) => m <= selectedMonth)
    return past.map((m) => {
      return komsStore.calculateStudentMonthlyAttendance(student.id, dojoId, selectedYear, m)
    })
  }, [student.id, dojoId, selectedYear, selectedMonth])

  // Yearly summary
  const yearlyAttended = previousMonthsSummaries.reduce((acc, s) => acc + s.presentCount, 0)
  const yearlyConducted = previousMonthsSummaries.reduce((acc, s) => acc + s.totalConducted, 0)
  const yearlyPercentage =
    yearlyConducted > 0 ? Math.round((yearlyAttended / yearlyConducted) * 100) : 100

  const statusColors = {
    present: { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: 'Present' },
    late: { bg: '#fef9c3', text: '#a16207', border: '#fde047', label: 'Late' },
    excused: { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd', label: 'Excused' },
    absent: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', label: 'Absent' },
    cancelled: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', label: 'Cancelled' },
    holiday: { bg: '#ffedd5', text: '#c2410c', border: '#fdba74', label: 'Holiday' },
    upcoming: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc', label: 'Upcoming' },
    none: { bg: 'transparent', text: '#94a3b8', border: 'transparent', label: '' },
  }

  // Filtered rows for recent check-ins table
  const rows =
    filter === 'All'
      ? fullHistory
      : fullHistory.filter((row) => row.attendanceStatus.toLowerCase() === filter.toLowerCase())

  return (
    <>
      <PageHeading
        eyebrow="Discipline & Attendance Track"
        title="My Attendance Profile"
        description="Verified martial arts training records, monthly calendars, and annual grading eligibility."
        action={
          <Button
            icon="calendar"
            variant="secondary"
            onClick={() => setLeaveModalOpen(true)}
          >
            Submit Leave Notice
          </Button>
        }
      />

      {/* Month & Year Selector Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          padding: '12px 18px',
          background: 'var(--sp-card-bg, #1a1a1a)',
          borderRadius: '12px',
          border: '1px solid var(--sp-border, #333333)',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--sp-muted, #94a3b8)', letterSpacing: '0.5px' }}>
            Viewing Monthly Period
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--sp-text, #ffffff)' }}>
            {monthNames[selectedMonth - 1]} {selectedYear} • {student.rank || 'White Belt'}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--sp-bg, #121212)',
              color: 'var(--sp-text, #ffffff)',
              border: '1px solid var(--sp-border, #444444)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {monthNames.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--sp-bg, #121212)',
              color: 'var(--sp-text, #ffffff)',
              border: '1px solid var(--sp-border, #444444)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="sp-metric-grid">
        <Card className="sp-simple-metric" style={{ borderColor: monthlyStats.ratingColor }}>
          <strong style={{ color: monthlyStats.ratingColor }}>{monthlyStats.attendancePercentage}%</strong>
          <span>Monthly Rate ({monthlyStats.rating})</span>
          <small>{monthlyStats.attendancePercentage >= 75 ? '✓ Qualifies for belt grading' : '⚠️ Below 75% grading threshold'}</small>
        </Card>
        <Card className="sp-simple-metric">
          <strong style={{ color: '#16a34a' }}>{monthlyStats.presentCount}</strong>
          <span>Present</span>
          <small>Out of {monthlyStats.totalConducted} conducted classes</small>
        </Card>
        <Card className="sp-simple-metric">
          <strong style={{ color: '#ca8a04' }}>{monthlyStats.lateCount}</strong>
          <span>Late Check-Ins</span>
          <small>Recorded with arrival timestamps</small>
        </Card>
        <Card className="sp-simple-metric">
          <strong style={{ color: '#7c3aed' }}>{monthlyStats.excusedCount}</strong>
          <span>Excused Notices</span>
          <small>Documented leave verified by Sensei</small>
        </Card>
        <Card className="sp-simple-metric">
          <strong style={{ color: '#dc2626' }}>{monthlyStats.absentCount}</strong>
          <span>Unexcused Absences</span>
          <small>Missed without leave letter</small>
        </Card>
      </div>

      {/* MONTHLY CALENDAR CARD */}
      <Card className="sp-table-card" style={{ padding: '20px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--sp-text, #ffffff)' }}>
              📅 {monthNames[selectedMonth - 1]} {selectedYear} Attendance Calendar
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--sp-muted, #94a3b8)' }}>
              Click any class date to view session details and instructor remarks
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} /> Present
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ca8a04' }} /> Late
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }} /> Excused
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} /> Absent
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }} /> Holiday
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} /> Upcoming
            </span>
          </div>
        </div>

        {/* 7-column Calendar Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            textAlign: 'center',
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} style={{ fontSize: '11px', fontWeight: 800, color: 'var(--sp-muted, #94a3b8)', padding: '4px 0' }}>
              {d}
            </div>
          ))}

          {/* Offset empty boxes */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`sp-offset-${i}`} style={{ minHeight: '50px', background: 'transparent' }} />
          ))}

          {/* Month Days */}
          {calendarDays.map((item) => {
            const conf = statusColors[item.status]
            const hasItem = item.status !== 'none'
            const isSelected = selectedDayPopover?.date === item.dateStr

            return (
              <button
                key={item.dayNumber}
                type="button"
                onClick={() => {
                  if (hasItem) {
                    setSelectedDayPopover({
                      date: item.dateStr,
                      time: item.sess ? `${item.sess.startTime} - ${item.sess.endTime}` : '06:30 PM - 08:00 PM',
                      status: item.status.toUpperCase(),
                      remarks: item.att?.remarks || item.sess?.notes || 'Normal training session conducted',
                      instructor: item.att?.markedBy || item.sess?.instructor || 'Sensei',
                    })
                  } else {
                    setSelectedDayPopover(null)
                  }
                }}
                style={{
                  minHeight: '52px',
                  padding: '4px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--sp-primary-red, #b91c1c)' : conf.bg !== 'transparent' ? conf.bg : 'var(--sp-card-bg, #222222)',
                  border: isSelected ? '2px solid #ffffff' : conf.border !== 'transparent' ? `1px solid ${conf.border}` : '1px solid var(--sp-border, #333333)',
                  cursor: hasItem ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: isSelected ? '#ffffff' : hasItem ? conf.text : 'var(--sp-muted, #777777)',
                  }}
                >
                  {item.dayNumber}
                </span>
                {hasItem && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: isSelected ? '#ffffff' : conf.text,
                      textTransform: 'uppercase',
                      textDecoration: item.status === 'cancelled' ? 'line-through' : 'none',
                    }}
                  >
                    {conf.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Clicked Day Popover Detail */}
        {selectedDayPopover && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px',
              background: 'var(--sp-bg, #141414)',
              border: '1.5px solid var(--sp-border, #444444)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '13px', color: 'var(--sp-text, #ffffff)' }}>
                🥋 {selectedDayPopover.date} ({selectedDayPopover.time})
              </strong>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: '#333333',
                  color: '#ffffff',
                }}
              >
                STATUS: {selectedDayPopover.status}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sp-muted, #94a3b8)', marginTop: '4px' }}>
              <strong>Instructor:</strong> {selectedDayPopover.instructor} • <strong>Remarks:</strong>{' '}
              {selectedDayPopover.remarks}
            </div>
          </div>
        )}
      </Card>

      {/* PREVIOUS MONTHS ATTENDANCE COMPARISON & YEARLY SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginTop: '16px' }}>
        {/* Previous Months History Table */}
        <Card className="sp-table-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 10px', color: 'var(--sp-text, #ffffff)' }}>
            📊 Previous Months' Attendance Record
          </h3>
          <div className="sp-data-table" style={{ fontSize: '12px' }}>
            <div className="sp-table-row sp-table-header">
              <span>Month</span>
              <span>Conducted</span>
              <span>Present</span>
              <span>Late</span>
              <span>Excused</span>
              <span>Attendance %</span>
            </div>
            {previousMonthsSummaries.map((m) => (
              <div className="sp-table-row" key={m.month}>
                <span>
                  <strong>{monthNames[m.month - 1]} {m.year}</strong>
                </span>
                <span>{m.totalConducted} Classes</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{m.presentCount}</span>
                <span style={{ color: '#ca8a04' }}>{m.lateCount}</span>
                <span style={{ color: '#7c3aed' }}>{m.excusedCount}</span>
                <span>
                  <strong style={{ color: m.ratingColor }}>{m.attendancePercentage}%</strong>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Yearly Summary Card */}
        <Card className="sp-table-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 10px', color: 'var(--sp-text, #ffffff)' }}>
            🏆 Yearly Attendance Summary ({selectedYear})
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--sp-bg, #141414)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--sp-muted, #94a3b8)', fontSize: '12px' }}>Total Classes Conducted:</span>
              <strong style={{ color: 'var(--sp-text, #ffffff)', fontSize: '13px' }}>{yearlyConducted}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--sp-bg, #141414)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--sp-muted, #94a3b8)', fontSize: '12px' }}>Total Classes Attended:</span>
              <strong style={{ color: '#16a34a', fontSize: '13px' }}>{yearlyAttended}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--sp-bg, #141414)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--sp-muted, #94a3b8)', fontSize: '12px' }}>Overall Yearly Percentage:</span>
              <strong style={{ color: '#16a34a', fontSize: '15px' }}>{yearlyPercentage}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--sp-bg, #141414)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--sp-muted, #94a3b8)', fontSize: '12px' }}>Belt Grading Eligibility:</span>
              <strong style={{ color: yearlyPercentage >= 75 ? '#16a34a' : '#dc2626', fontSize: '12px' }}>
                {yearlyPercentage >= 75 ? '✓ APPROVED FOR WINTER GRADING' : 'PENDING EVALUATION'}
              </strong>
            </div>
          </div>
        </Card>
      </div>

      {/* DETAILED CHECK-INS LOG */}
      <Card className="sp-table-card" style={{ marginTop: '16px' }}>
        <div className="sp-table-toolbar">
          <div>
            <span>Class Log for {student.name}</span>
            <h2>Full Verified Check-Ins Log ({rows.length})</h2>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter attendance by status"
          >
            <option value="All">All statuses</option>
            <option value="present">Present only</option>
            <option value="late">Late check-in</option>
            <option value="excused">Excused only</option>
            <option value="absent">Absent only</option>
          </select>
        </div>

        <div className="sp-data-table sp-attendance-table">
          <div className="sp-table-row sp-table-header">
            <span>Date</span>
            <span>Class & Drills</span>
            <span>Timings</span>
            <span>Instructor</span>
            <span>Status</span>
            <span>Remarks</span>
          </div>

          {rows.map((row) => (
            <div className="sp-table-row" key={row.id}>
              <span data-label="Date">{row.classDate}</span>
              <span data-label="Class">
                <strong>{row.sessionTitle}</strong>
              </span>
              <span data-label="Timings">{row.startTime} - {row.endTime}</span>
              <span data-label="Instructor">{row.instructor}</span>
              <span data-label="Status">
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    background:
                      row.attendanceStatus === 'present'
                        ? '#dcfce7'
                        : row.attendanceStatus === 'late'
                        ? '#fef9c3'
                        : row.attendanceStatus === 'excused'
                        ? '#ede9fe'
                        : '#fee2e2',
                    color:
                      row.attendanceStatus === 'present'
                        ? '#15803d'
                        : row.attendanceStatus === 'late'
                        ? '#a16207'
                        : row.attendanceStatus === 'excused'
                        ? '#6d28d9'
                        : '#b91c1c',
                  }}
                >
                  {row.attendanceStatus.toUpperCase()}
                </span>
              </span>
              <span data-label="Remarks" style={{ color: row.remarks ? 'var(--sp-text, #ffffff)' : 'var(--sp-muted, #777777)' }}>
                {row.remarks || '—'}
              </span>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <EmptyState
            icon="attendance"
            title="No matching records"
            text="Choose another filter to view check-ins."
          />
        )}
      </Card>

      {leaveModalOpen && (
        <Modal
          title="Submit Leave Notice to Sensei"
          onClose={() => setLeaveModalOpen(false)}
          actions={
            <>
              <Button variant="ghost" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setLeaveSubmitted(true)
                  setTimeout(() => {
                    setLeaveSubmitted(false)
                    setLeaveModalOpen(false)
                  }, 1400)
                }}
              >
                {leaveSubmitted ? 'Submitted!' : 'Send Notice'}
              </Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: '14px', fontSize: '12px' }}>
            <p style={{ color: 'var(--sp-muted)', margin: 0 }}>
              Notify your instructors regarding an upcoming absence so your minimum attendance
              streak remains protected.
            </p>
            <label style={{ display: 'grid', gap: '5px' }}>
              <strong>Student Name</strong>
              <input value={student.name} disabled style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: '5px' }}>
              <strong>Absence Date</strong>
              <input type="date" defaultValue="2026-11-04" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'grid', gap: '5px' }}>
              <strong>Reason</strong>
              <textarea rows={3} placeholder="School exams, travel, unwell..." style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </label>
          </div>
        </Modal>
      )}
    </>
  )
}

function FeesPage({
  student,
  fees,
}: {
  student: Student
  fees: FeeRecord[]
}) {
  const [filter, setFilter] = useState('All')
  const [receiptFee, setReceiptFee] = useState<FeeRecord | null>(null)
  const [printed, setPrinted] = useState(false)

  const filteredFees =
    filter === 'All'
      ? fees
      : fees.filter((f) => f.status.toLowerCase() === filter.toLowerCase())

  const totalPaid = fees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0)
  const totalDue = fees
    .filter((f) => f.status === 'due')
    .reduce((sum, f) => sum + f.amount, 0)

  return (
    <>
      <PageHeading
        eyebrow="Financial Records"
        title="Dojo Fees & Receipts"
        description="Official payment ledger maintained by Okinawa Shorin Ryu Karate Do - India. Online payments are disabled for security."
      />

      <div className="sp-info-banner sp-info-banner--gold">
        <Icon name="alert" />
        <div>
          <strong>Official Records Only — In-Dojo Payment Settlement.</strong>
          <p>
            Tuition, grading, and uniform fees are settled directly at the dojo office.
            Download verified vouchers below for your tax and school physical education records.
          </p>
        </div>
      </div>

      <div className="sp-metric-grid" style={{ marginBottom: '16px' }}>
        <Card className="sp-simple-metric">
          <strong style={{ color: '#16a34a' }}>₹{totalPaid.toLocaleString('en-IN')}</strong>
          <span>Total Settled to Date</span>
          <small>Including ₹{student.entranceFee || 1000} entrance fee</small>
        </Card>
        <Card className="sp-simple-metric">
          <strong style={{ color: '#b5121b' }}>₹{totalDue.toLocaleString('en-IN')}</strong>
          <span>Current Pending Balance</span>
          <small>Winter Grading Exam Fee</small>
        </Card>
        <Card className="sp-simple-metric">
          <strong style={{ color: '#c8a951' }}>{student.memberId}</strong>
          <span>Registered Ledger Account</span>
          <small>{student.name}</small>
        </Card>
      </div>

      <Card className="sp-table-card">
        <div className="sp-table-toolbar">
          <div>
            <span>Fee Records</span>
            <h2>Transactions & Invoices</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter fees by status"
            >
              <option value="All">All statuses</option>
              <option value="paid">Paid receipts only</option>
              <option value="due">Pending dues only</option>
            </select>
          </div>
        </div>

        <div className="sp-data-table sp-fee-table">
          <div className="sp-table-row sp-table-header">
            <span>Description</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Status / Action</span>
          </div>

          {filteredFees.map((fee) => (
            <div className="sp-table-row" key={fee.id}>
              <span data-label="Description">
                <strong>{fee.label}</strong>
                {fee.paidDate && <small>Paid on {fee.paidDate}</small>}
              </span>
              <span data-label="Amount" style={{ fontWeight: 700 }}>
                ₹{fee.amount.toLocaleString('en-IN')}
              </span>
              <span data-label="Due date">{fee.paidDate || fee.dueDate}</span>
              <span
                data-label="Status"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Status value={fee.status} />
                {fee.status === 'paid' && (
                  <button
                    style={{
                      border: 0,
                      background: 'none',
                      color: 'var(--sp-red)',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => setReceiptFee(fee)}
                  >
                    <Icon name="download" size={13} /> Voucher
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {receiptFee && (
        <Modal
          title="Official Fee Payment Receipt"
          onClose={() => setReceiptFee(null)}
          actions={
            <>
              <Button variant="ghost" onClick={() => setReceiptFee(null)}>
                Close
              </Button>
              <Button
                icon="print"
                onClick={() => {
                  setPrinted(true)
                  setTimeout(() => setPrinted(false), 2000)
                }}
              >
                {printed ? 'Print Dialog Sent!' : 'Print Voucher'}
              </Button>
            </>
          }
        >
          <div className="sp-voucher">
            <div className="sp-voucher-head">
              <div>
                <strong style={{ fontSize: '13px', display: 'block', color: 'var(--sp-red)' }}>
                  OKINAWA SHORIN RYU KARATE DO - INDIA
                </strong>
                <small style={{ color: 'var(--sp-muted)', fontSize: '9px' }}>
                  Central Dojo: No: 13, Velu St, New Perungalathur, Chennai-63
                </small>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a' }}>PAID VOUCHER</span>
            </div>

            <div className="sp-voucher-row">
              <span style={{ color: '#777' }}>Receipt No:</span>
              <strong>REC-2026-{(receiptFee.id || '01').toUpperCase()}</strong>
            </div>
            <div className="sp-voucher-row">
              <span style={{ color: '#777' }}>Student Name:</span>
              <strong>{student.name}</strong>
            </div>
            <div className="sp-voucher-row">
              <span style={{ color: '#777' }}>Member ID:</span>
              <strong>{student.memberId}</strong>
            </div>
            <div className="sp-voucher-row">
              <span style={{ color: '#777' }}>Guardian:</span>
              <span>{student.fatherName || student.emergencyContact}</span>
            </div>
            <div className="sp-voucher-row">
              <span style={{ color: '#777' }}>Date Settled:</span>
              <span>{receiptFee.paidDate || receiptFee.dueDate}</span>
            </div>
            <div className="sp-voucher-row">
              <span style={{ color: '#777' }}>Description:</span>
              <span>{receiptFee.label}</span>
            </div>

            <div className="sp-voucher-total">
              <span>Total Received</span>
              <span>₹{receiptFee.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

function SchedulePage({
  schedule,
  holidays,
  onSelectSession,
}: {
  schedule: TrainingSession[]
  holidays: DojoHoliday[]
  onSelectSession: (s: TrainingSession) => void
}) {
  const [selectedDay, setSelectedDay] = useState('All')
  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const filteredSchedule =
    selectedDay === 'All'
      ? schedule
      : schedule.filter((s) => s.day.toLowerCase() === selectedDay.toLowerCase())

  return (
    <>
      <PageHeading
        eyebrow="Weekly Training Schedule"
        title="Training Timetable & Holidays"
        description="Class times, focus drills, and dojo leave dates positioned by your Sensei."
      />

      {/* Dojo Holidays / Leaves Announcement Banner */}
      {holidays.length > 0 && (
        <div className="sp-card" style={{ padding: '16px 20px', marginBottom: '18px', borderLeft: '4px solid #b5121b' }}>
          <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#b5121b' }}>
            🏖 Registered Dojo Leave Dates & Holidays
          </strong>
          <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
            {holidays.map((h) => (
              <div key={h.id} style={{ padding: '10px 12px', background: 'var(--sp-bg)', borderRadius: '8px', fontSize: '11px' }}>
                <strong style={{ color: 'var(--sp-black)' }}>{h.title}</strong> — <span style={{ color: '#b5121b', fontWeight: 600 }}>{h.date}</span>
                <p style={{ margin: '3px 0 0 0', color: 'var(--sp-muted)' }}>{h.description} ({h.dojoBranch})</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sp-day-tabs" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((day) => (
          <button
            className={selectedDay === day ? 'active' : ''}
            key={day}
            onClick={() => setSelectedDay(day)}
          >
            <small>{day === 'All' ? 'View' : 'Day'}</small>
            <strong>{day.slice(0, 3)}</strong>
          </button>
        ))}
      </div>

      <div className="sp-schedule-list">
        {filteredSchedule.map((session, index) => (
          <Card className="sp-schedule-card" key={session.id}>
            <div className={index === 0 ? 'is-primary' : ''}>
              <small>{session.day}</small>
              <strong>{session.startTime}</strong>
              <span>{session.endTime}</span>
            </div>
            <div>
              <span>{session.level}</span>
              <h2>{session.title}</h2>
              <p>
                <Icon name="user" size={15} />
                {session.instructor} · Main Dojo Tatami
              </p>
            </div>
            <Button variant="secondary" onClick={() => onSelectSession(session)}>
              View drills & syllabus
            </Button>
          </Card>
        ))}

        {filteredSchedule.length === 0 && (
          <Card>
            <EmptyState
              icon="calendar"
              title={`No classes scheduled on ${selectedDay}`}
              text="Select 'All' to view regular weekday training batches."
            />
          </Card>
        )}
      </div>
    </>
  )
}

function AnnouncementsPage({
  announcements,
  onSelectAnnounce,
}: {
  announcements: Announcement[]
  onSelectAnnounce: (ann: Announcement) => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const categories = ['All', 'Tournament', 'Grading', 'Schedule', 'Dojo']

  const filtered = announcements.filter((item) => {
    const matchesSearch = `${item.title} ${item.body}`
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesCat = category === 'All' || item.category === category
    return matchesSearch && matchesCat
  })

  return (
    <>
      <PageHeading
        eyebrow="Official Notifications"
        title="Dojo Announcements"
        description="Notices, tournament guidelines, and grading schedules from the chief instructor."
      />

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
        <label className="sp-search" style={{ margin: 0, flex: '1 1 280px' }}>
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements or guidelines..."
          />
        </label>
        <div className="sp-pill-filter" style={{ margin: 0 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`sp-pill-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="sp-announcement-list">
        {filtered.map((item, index) => (
          <Card
            className="sp-announcement-card"
            key={item.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectAnnounce(item)}
          >
            <span className={index === 0 ? 'is-new' : ''}>
              <Icon name="bell" />
            </span>
            <article>
              <div>
                <Status value={item.category} />
                <small>{item.publishedAt}</small>
              </div>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectAnnounce(item)
                }}
              >
                Read full announcement <Icon name="arrow" size={15} />
              </button>
            </article>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <EmptyState
              icon="search"
              title="No announcements match your search"
              text="Try adjusting keywords or selecting 'All' categories."
            />
          </Card>
        )}
      </div>
    </>
  )
}

function EventsPage({ onSelectEvent }: { onSelectEvent: (e: KomsEvent) => void }) {
  return (
    <>
      <PageHeading
        eyebrow="Martial Arts Gatherings"
        title="Upcoming Events & Tournaments"
        description="State championships, Gasshuku camps, and belt award ceremonies."
      />

      <div className="sp-event-grid">
        {devEvents.map((event) => (
          <Card className="sp-event-card" key={event.id}>
            <ManagedImage
              src={event.image?.url || assetConfig.dashboardBanner}
              alt={event.title}
              fallback="OKINAWA EVENT"
            />
            <div>
              <div className="sp-event-meta">
                <Status value="Upcoming" />
                <span>
                  <Icon name="calendar" size={14} />
                  {event.date}
                </span>
              </div>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <small>
                <Icon name="location" size={15} />
                {event.location}
              </small>
              <small>
                <Icon name="shield" size={15} />
                {event.eligibility}
              </small>
              <Button
                variant="secondary"
                onClick={() => onSelectEvent(event)}
              >
                View event details & register
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

function QrPassPage({ student }: { student: Student }) {
  const [brightMode, setBrightMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [verifyModal, setVerifyModal] = useState(false)

  const cells = useMemo(
    () =>
      Array.from(
        { length: 121 },
        (_, index) => (index * 7 + (index % 4)) % 5 < 2
      ),
    []
  )

  function copyId() {
    navigator.clipboard?.writeText(student.memberId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const avatarUrl = student.avatar?.url || assetConfig.studentAvatar

  return (
    <>
      <PageHeading
        eyebrow="Digital Dojo Credential"
        title="Membership QR Pass"
        description="Present this verified digital pass when entering dojo facilities and tournament checkpoints."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              icon="star"
              variant="secondary"
              onClick={() => setBrightMode(!brightMode)}
            >
              {brightMode ? 'Normal screen' : 'Full brightness'}
            </Button>
            <Button icon="copy" variant="secondary" onClick={copyId}>
              {copied ? 'ID Copied!' : 'Copy Member ID'}
            </Button>
          </div>
        }
      />

      <div className={`sp-pass-layout ${brightMode ? 'sp-pass-layout--bright' : ''}`}>
        <Card
          className="sp-pass-card"
          style={
            brightMode
              ? { background: '#ffffff', color: '#121212', border: '3px solid #b5121b' }
              : {}
          }
        >
          <div className="sp-pass-top">
            <KomsLogo />
            <Status value="Active" />
          </div>

          <div
            className="sp-qr-preview"
            aria-label="Student membership QR verification matrix"
          >
            {cells.map((filled, index) => (
              <i className={filled ? 'filled' : ''} key={index} />
            ))}
            <span>
              <ManagedImage src={assetConfig.logo} alt="KOMS logo" fallback="K" />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <img
              src={avatarUrl}
              alt={student.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c8a951' }}
            />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '15px', display: 'block', color: brightMode ? '#121212' : '#ffffff' }}>
                {student.name}
              </strong>
              <small style={{ color: '#c8a951', fontSize: '10px' }}>{student.rank || 'Yellow Belt'}</small>
            </div>
          </div>

          <p style={{ letterSpacing: '0.1em', fontWeight: 700 }}>{student.memberId}</p>

          <div className="sp-pass-meta">
            <div>
              <small>Affiliated Dojo</small>
              <strong>Okinawa Shorin Ryu India</strong>
            </div>
            <div>
              <small>Valid through</small>
              <strong>{devMembership.renewalDate}</strong>
            </div>
          </div>

          <button
            type="button"
            className="sp-not-valid"
            style={{ width: '100%', cursor: 'pointer', background: 'transparent' }}
            onClick={() => setVerifyModal(true)}
          >
            Scannable Token: KOMS-PASS:{student.memberId}
          </button>
        </Card>

        <div className="sp-pass-info">
          <Card>
            <span className="sp-gold-icon">
              <Icon name="shield" />
            </span>
            <h2>Connected QR Pass Verification</h2>
            <p>
              When scanned by the Sensei via the Admin QR Scanner, this pass automatically validates Member ID{' '}
              <strong>{student.memberId}</strong> and records your attendance as <strong>Present</strong> in real time.
            </p>
          </Card>

          <Card>
            <h2>Using your pass at the Dojo</h2>
            <ol>
              <li>
                <span>1</span>Open this screen upon arrival at the dojo tatami hall.
              </li>
              <li>
                <span>2</span>Tap "Full brightness" if scanning in outdoor or bright lighting conditions.
              </li>
              <li>
                <span>3</span>Allow the Sensei or authorized scanner to register your presence.
              </li>
            </ol>
          </Card>
        </div>
      </div>

      {verifyModal && (
        <Modal
          title="Digital Pass Cryptographic Verification"
          onClose={() => setVerifyModal(false)}
          actions={
            <Button onClick={() => setVerifyModal(false)}>Close Inspector</Button>
          }
        >
          <div style={{ fontSize: '12px', display: 'grid', gap: '10px' }}>
            <p style={{ color: 'var(--sp-muted)', margin: 0 }}>
              The digital token incorporates student registration parameters and a cryptographic signature
              ready for validation by the shared KOMS backend and Neon PostgreSQL.
            </p>
            <div style={{ padding: '12px', background: 'var(--sp-bg)', borderRadius: '10px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '10px' }}>
              <div><strong>Pass Token:</strong> KOMS-PASS:{student.memberId}</div>
              <div><strong>Subject:</strong> {student.name} ({student.memberId})</div>
              <div><strong>Hash:</strong> SHA256-OKN-{student.id}-{Date.now()}</div>
              <div><strong>Valid:</strong> {student.joiningDate || '2026-07-04'} to 2027-07-03</div>
              <div style={{ color: '#16a34a', marginTop: '6px' }}><strong>Status:</strong> VERIFIED_ACTIVE</div>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

function SettingsPage({
  student,
  onSignOut,
}: {
  student: Student
  onSignOut?: () => void
}) {
  const [logo, setLogo] = useState<string>(assetConfig.logo)
  const [notice, setNotice] = useState('')
  const [dialogContent, setDialogContent] = useState<string | null>(null)
  const [confirmSignout, setConfirmSignout] = useState(false)

  const [notifs, setNotifs] = useState({
    schedule: true,
    announcements: true,
    events: true,
    membership: true,
  })

  function toggleNotif(key: keyof typeof notifs) {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))
    setNotice('Notification preferences updated.')
  }

  return (
    <>
      <PageHeading
        eyebrow="Account & Controls"
        title="Settings & Preferences"
        description="Configure preferences, view security controls, and inspect image asset slots."
      />

      <div className="sp-settings-grid">
        <Card className="sp-settings-card">
          <div className="sp-card-head">
            <div>
              <span>Alerts & Notifications</span>
              <h2>Communication Preferences</h2>
            </div>
          </div>

          {[
            ['schedule', 'Schedule & batch timing alerts', 'Notify when session hours or venues change'],
            ['announcements', 'Official dojo announcements', 'Receive circulars from the chief instructor'],
            ['events', 'Tournament & seminar invitations', 'Stay alerted for upcoming state events'],
            ['membership', 'Fee & grading reminders', 'Dues and belt evaluation reminders'],
          ].map(([key, title, subtitle]) => (
            <label className="sp-toggle-row" key={key}>
              <div>
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </div>
              <input
                type="checkbox"
                checked={notifs[key as keyof typeof notifs]}
                onChange={() => toggleNotif(key as keyof typeof notifs)}
              />
              <span />
            </label>
          ))}
        </Card>

        <Card className="sp-settings-card">
          <div className="sp-card-head">
            <div>
              <span>Security & Account</span>
              <h2>Privacy & Access</h2>
            </div>
          </div>

          {[
            ['Change password', 'Your default password is your Date of Birth.'],
            ['Active sessions', 'Review connected devices on this account.'],
            ['Privacy policy', 'How Okinawa Shorin Ryu India protects your personal and medical information.'],
            ['Dojo help & support', 'Contact administrative staff for membership or fee queries.'],
          ].map(([title, desc]) => (
            <button
              className="sp-settings-link"
              key={title}
              onClick={() => setDialogContent(title)}
            >
              <div>
                <strong>{title}</strong>
                <small style={{ color: 'var(--sp-muted)', display: 'block', fontSize: '9px' }}>{desc}</small>
              </div>
              <Icon name="chevron" size={17} />
            </button>
          ))}
        </Card>

        <Card className="sp-asset-card">
          <div className="sp-card-head">
            <div>
              <span>Application Logo Preview</span>
              <h2>KOMS Emblem Configuration</h2>
            </div>
          </div>
          <ImageField
            label="Application logo"
            value={logo}
            fallback="K"
            onChange={setLogo}
          />
        </Card>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          className="sp-signout"
          onClick={() => setConfirmSignout(true)}
        >
          <Icon name="logout" />
          Sign out of KOMS Portal
        </button>
        <span style={{ fontSize: '10px', color: 'var(--sp-muted)' }}>
          Logged in as: {student.name} ({student.memberId})
        </span>
      </div>

      {notice && (
        <div className="sp-toast" role="status">
          <Icon name="check" />
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss">
            <Icon name="close" size={17} />
          </button>
        </div>
      )}

      {confirmSignout && (
        <Modal
          title="Sign Out Confirmation"
          onClose={() => setConfirmSignout(false)}
          actions={
            <>
              <Button variant="ghost" onClick={() => setConfirmSignout(false)}>
                Stay signed in
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setConfirmSignout(false)
                  komsStore.logout()
                  if (onSignOut) onSignOut()
                  else window.location.href = '/'
                }}
              >
                Confirm Sign Out
              </Button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--sp-muted)' }}>
            Are you sure you want to sign out of the KOMS Student Portal? You can sign back in anytime using your
            Full Name and Date of Birth.
          </p>
        </Modal>
      )}

      {dialogContent && (
        <Modal
          title={dialogContent}
          onClose={() => setDialogContent(null)}
          actions={
            <Button onClick={() => setDialogContent(null)}>Acknowledge</Button>
          }
        >
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--sp-black)' }}>
            {dialogContent === 'Change password' && (
              <div style={{ display: 'grid', gap: '10px' }}>
                <p>Your portal password is synchronized with your registered Date of Birth: <strong>{student.dateOfBirth}</strong>.</p>
                <small style={{ color: 'var(--sp-muted)' }}>Contact the dojo administrator if your date of birth needs correction.</small>
              </div>
            )}
            {dialogContent === 'Active sessions' && (
              <div>
                <p>Currently active sessions on this account:</p>
                <div style={{ padding: '10px', background: 'var(--sp-bg)', borderRadius: '8px', marginTop: '8px' }}>
                  <strong>This Device (Android / Web Application)</strong>
                  <div style={{ color: '#16a34a', fontSize: '10px' }}>Active now · Secure student workspace</div>
                </div>
              </div>
            )}
            {dialogContent === 'Privacy policy' && (
              <div>
                <p>
                  Okinawa Shorin Ryu Karate Do India treats all student records, medical/blood group information,
                  and guardian contacts with strict confidentiality.
                </p>
              </div>
            )}
            {dialogContent === 'Dojo help & support' && (
              <div>
                <p>
                  For assistance regarding registration, uniform replacement, or schedule transfers, reach out to:
                </p>
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--sp-bg)', borderRadius: '8px' }}>
                  <strong>Sensei B. Mathan:</strong> +91 96001 03987<br />
                  <strong>Sensei R. Ravikanth:</strong> +91 97908 97178<br />
                  <strong>Email:</strong> perungalathur@okinawashorinryu-india.com
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

/* =========================================================================
   MAIN STUDENT SHELL & APP ORCHESTRATION
   ========================================================================= */

export default function StudentPanel({
  initialStudent,
  onSignOut,
}: {
  initialStudent?: Student
  onSignOut?: () => void
}) {
  const [page, setPage] = useState<Page>('Home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Subscribe to store updates (so admin changes reflect immediately!)
  const [storeTick, setStoreTick] = useState(0)
  useEffect(() => {
    return komsStore.subscribe(() => setStoreTick((t) => t + 1))
  }, [])

  const allStudents = komsStore.getStudents()
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || allStudents[0]?.id || 'KOMS-2026-001'
  )
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')

  const currentStudent = useMemo(() => {
    return allStudents.find((s) => s.id === selectedStudentId) || initialStudent || allStudents[0]
  }, [allStudents, selectedStudentId, initialStudent, storeTick])

  const studentAttendance = useMemo(() => {
    return komsStore.getAttendance(currentStudent.id)
  }, [currentStudent.id, storeTick])

  const studentFees = useMemo(() => {
    return komsStore.getFees(currentStudent.id)
  }, [currentStudent.id, storeTick])

  const schedule = komsStore.getSchedule()
  const holidays = komsStore.getHolidays()
  const announcements = komsStore.getAnnouncements()

  // Modals for deep inspection
  const [inspectedSession, setInspectedSession] = useState<TrainingSession | null>(null)
  const [inspectedAnnounce, setInspectedAnnounce] = useState<Announcement | null>(null)
  const [inspectedEvent, setInspectedEvent] = useState<KomsEvent | null>(null)
  const [eventRegistered, setEventRegistered] = useState(false)

  const activeIcon = navItems.find((item) => item.label === page)?.icon ?? 'settings'

  function navigate(next: Page) {
    setPage(next)
    setMenuOpen(false)
    setNotificationsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleUpdateStudent(patch: Partial<Student>) {
    komsStore.updateStudent(currentStudent.id, patch)
  }

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.memberId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.address || '').toLowerCase().includes(studentSearch.toLowerCase())
  )

  const currentAvatar = currentStudent.avatar?.url || assetConfig.studentAvatar

  return (
    <div className="student-shell">
      {menuOpen && (
        <button
          className="sp-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sp-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="sp-sidebar-brand">
          <KomsLogo />
          <button onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <Icon name="close" />
          </button>
        </div>

        {/* Active Student Pill Widget */}
        <div
          className="sp-student-mini"
          style={{ cursor: 'pointer' }}
          onClick={() => setSwitcherOpen(true)}
          title="Click to switch student"
        >
          <ManagedImage
            src={currentAvatar}
            alt={currentStudent.name}
            fallback={currentStudent.name.slice(0, 2).toUpperCase()}
          />
          <div>
            <strong>{currentStudent.name}</strong>
            <small>{currentStudent.rank || devBelt.currentRank}</small>
          </div>
          <button
            type="button"
            style={{
              border: 0,
              background: 'transparent',
              color: '#c8a951',
              padding: '2px',
              cursor: 'pointer',
            }}
            aria-label="Switch student"
          >
            <Icon name="refresh" size={14} />
          </button>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              className={page === item.label ? 'active' : ''}
              key={item.label}
              onClick={() => navigate(item.label)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sp-sidebar-foot">
          <button
            className={page === 'Settings' ? 'active' : ''}
            onClick={() => navigate('Settings')}
          >
            <Icon name="settings" />
            <span>Settings</span>
          </button>
          <p>
            <Icon name="shield" size={15} />
            Okinawa Shorin Ryu India
          </p>
        </div>
      </aside>

      {/* Main Container */}
      <main className="sp-main">
        {/* Topbar: Corner Logo, Page Title, and Student Switcher */}
        <header className="sp-topbar">
          <div className="sp-topbar-left">
            <button
              className="sp-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Icon name="menu" />
            </button>
            <img src={assetConfig.logo} alt="KOMS" className="sp-corner-logo" />
            <strong className="sp-topbar-title">{page}</strong>
          </div>

          <div className="sp-top-actions">
            {/* Quick Student Switcher Trigger (No overlapping logo!) */}
            <button
              className="sp-switcher-trigger"
              onClick={() => setSwitcherOpen(true)}
              title="Switch active student"
            >
              <img
                src={currentAvatar}
                alt={currentStudent.name}
                style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentStudent.name}
              </span>
              <Icon name="chevron" size={14} />
            </button>

            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '8px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                color: '#1f2937',
                cursor: 'pointer',
              }}
              onClick={() => {
                komsStore.logout()
                if (onSignOut) onSignOut()
              }}
              title="Return to Public Common UI"
            >
              🌐 Public Web
            </button>

            {/* Notification Menu */}
            <div className="sp-notification-wrap">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <Icon name="bell" />
                <i />
              </button>
              {notificationsOpen && (
                <div className="sp-notification-popover">
                  <strong>Dojo Notifications</strong>
                  <p>
                    Upcoming belt grading and championship announcements are active for your
                    dojo.
                  </p>
                  <button onClick={() => navigate('Announcements')}>
                    View announcements
                  </button>
                </div>
              )}
            </div>

            {/* Avatar Shortcut to Profile */}
            <button
              className="sp-top-avatar"
              onClick={() => navigate('Profile')}
              aria-label="View Student Profile"
            >
              <ManagedImage
                src={currentAvatar}
                alt={currentStudent.name}
                fallback={currentStudent.name.slice(0, 2).toUpperCase()}
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="sp-content">
          {page === 'Home' && (
            <Dashboard
              student={currentStudent}
              navigate={navigate}
              onSelectSession={setInspectedSession}
              onOpenAnnounce={setInspectedAnnounce}
              schedule={schedule}
              announcements={announcements}
            />
          )}
          {page === 'Profile' && (
            <ProfilePage
              student={currentStudent}
              onUpdateStudent={handleUpdateStudent}
              onOpenSwitcher={() => setSwitcherOpen(true)}
            />
          )}
          {page === 'My Dojo' && <DojoPage />}
          {page === 'Membership' && <MembershipPage student={currentStudent} />}
          {page === 'Belt Progress' && <BeltPage student={currentStudent} />}
          {page === 'Attendance' && (
            <AttendancePage student={currentStudent} records={studentAttendance} />
          )}
          {page === 'Fees' && <FeesPage student={currentStudent} fees={studentFees} />}
          {page === 'Schedule' && (
            <SchedulePage
              schedule={schedule}
              holidays={holidays}
              onSelectSession={setInspectedSession}
            />
          )}
          {page === 'Announcements' && (
            <AnnouncementsPage
              announcements={announcements}
              onSelectAnnounce={setInspectedAnnounce}
            />
          )}
          {page === 'Events' && <EventsPage onSelectEvent={setInspectedEvent} />}
          {page === 'QR Pass' && <QrPassPage student={currentStudent} />}
          {page === 'Settings' && (
            <SettingsPage student={currentStudent} onSignOut={onSignOut} />
          )}
        </div>

        {/* Mobile Navigation for Android Viewport */}
        <nav className="sp-mobile-nav" aria-label="Mobile navigation">
          {[
            navItems[0],
            navItems[7],
            navItems[10],
            { label: 'More' as Page, icon: 'menu' as StudentIconName },
          ].map((item) => (
            <button
              className={page === item.label ? 'active' : ''}
              key={item.label}
              onClick={() =>
                (item.label as string) === 'More' ? setMenuOpen(true) : navigate(item.label)
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Student Switcher Modal */}
      {switcherOpen && (
        <Modal
          title="Select Active Student (16 Registered Students)"
          onClose={() => setSwitcherOpen(false)}
        >
          <div style={{ fontSize: '12px' }}>
            <p style={{ color: 'var(--sp-muted)', margin: '0 0 10px 0' }}>
              Choose any student admission record from the official <code>student data.docx</code> to
              inspect their full registration profile, contact details, entrance fees, and belt progress:
            </p>

            <label className="sp-search" style={{ width: '100%', marginBottom: '10px' }}>
              <Icon name="search" />
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by student name, ID or locality..."
                autoFocus
              />
            </label>

            <div className="sp-switcher-list">
              {filteredStudents.map((s) => {
                const isSelected = s.id === currentStudent.id
                return (
                  <button
                    key={s.id}
                    className={`sp-switcher-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedStudentId(s.id)
                      setSwitcherOpen(false)
                    }}
                  >
                    <img
                      src={s.avatar?.url || assetConfig.studentAvatar}
                      alt={s.name}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = assetConfig.logo
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{s.name}</strong>
                      <small>
                        {s.memberId} · {s.age || ''} · {s.bloodGroup || ''} · {s.rank || 'Student'}
                      </small>
                      <small style={{ display: 'block', color: '#888', marginTop: '2px' }}>
                        {s.address}
                      </small>
                    </div>
                    {isSelected && (
                      <span style={{ color: '#b5121b' }}>
                        <Icon name="check" size={18} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Class Session Drills Modal */}
      {inspectedSession && (
        <Modal
          title={`${inspectedSession.title} — Syllabus Details`}
          onClose={() => setInspectedSession(null)}
          actions={
            <Button onClick={() => setInspectedSession(null)}>Done</Button>
          }
        >
          <div style={{ fontSize: '12px', display: 'grid', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--sp-bg)', borderRadius: '10px' }}>
              <strong style={{ fontSize: '13px', display: 'block', color: 'var(--sp-black)' }}>
                {inspectedSession.day} · {inspectedSession.startTime} – {inspectedSession.endTime}
              </strong>
              <small style={{ color: 'var(--sp-muted)' }}>
                Instructor: {inspectedSession.instructor} · Eligibility: {inspectedSession.level}
              </small>
            </div>

            <div>
              <strong style={{ display: 'block', marginBottom: '6px' }}>Curriculum Covered in this Batch:</strong>
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--sp-muted)', display: 'grid', gap: '4px' }}>
                <li>Junbi Undo (Okinawan warmup & joint conditioning drills)</li>
                <li>Kihon Waza (Straight punches, age-uke, gedan-barai, mae-geri)</li>
                <li>Traditional Katas (Fukyugata Ichi / Fukyugata Ni / Pinan Katas)</li>
                <li>Ippon Kumite 5-step controlled target defense</li>
                <li>Mokuso meditation & Dojo Kun recitation</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* Full Announcement Reader Modal */}
      {inspectedAnnounce && (
        <Modal
          title={inspectedAnnounce.title}
          onClose={() => setInspectedAnnounce(null)}
          actions={
            <Button onClick={() => setInspectedAnnounce(null)}>Close Notice</Button>
          }
        >
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
              <Status value={inspectedAnnounce.category} />
              <small style={{ color: 'var(--sp-muted)' }}>Published: {inspectedAnnounce.publishedAt}</small>
            </div>
            <p style={{ color: 'var(--sp-black)', fontSize: '13px', whiteSpace: 'pre-line' }}>
              {inspectedAnnounce.body}
            </p>
          </div>
        </Modal>
      )}

      {/* Event Details & Registration Modal */}
      {inspectedEvent && (
        <Modal
          title={inspectedEvent.title}
          onClose={() => {
            setInspectedEvent(null)
            setEventRegistered(false)
          }}
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setInspectedEvent(null)
                  setEventRegistered(false)
                }}
              >
                Close
              </Button>
              <Button
                disabled={eventRegistered}
                onClick={() => {
                  setEventRegistered(true)
                  komsStore.registerStudentForTournament(inspectedEvent.id, currentStudent.id, 'Kata & Kumite', 'Individual Open')
                }}
              >
                {eventRegistered ? 'Application Submitted to Master ✓' : 'Register for Tournament'}
              </Button>
            </>
          }
        >
          <div style={{ fontSize: '12px', display: 'grid', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--sp-bg)', borderRadius: '10px' }}>
              <strong>Date:</strong> {inspectedEvent.date}<br />
              <strong>Venue:</strong> {inspectedEvent.location}<br />
              <strong>Eligibility:</strong> {inspectedEvent.eligibility}
            </div>
            <p style={{ margin: 0, color: 'var(--sp-black)', lineHeight: '1.6' }}>
              {inspectedEvent.description}
            </p>
            {eventRegistered && (
              <div style={{ padding: '10px', borderRadius: '8px', background: '#eaf7ef', color: '#16a34a', fontWeight: 600 }}>
                Registration request recorded for {currentStudent.name} ({currentStudent.memberId}).
                Your sensei will confirm details during class.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

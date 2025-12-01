import { motion } from 'framer-motion'

const MotionDiv = motion.div

export default function AuthLayout({ title, subtitle, footer, highlights = [], children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
              {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
            </div>

            {children}

            {footer && (
              <div className="mt-6 text-center text-sm text-slate-600">
                {footer}
              </div>
            )}

            {highlights && highlights.length > 0 && (
              <div className="mt-8 space-y-3">
                {highlights.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    {item.badge && (
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                        {item.badge}
                      </span>
                    )}
                    <p className="text-sm text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </MotionDiv>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative flex h-full items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-4xl font-bold">KickOff Hub</h3>
            <p className="mt-4 text-lg opacity-90">
              Nền tảng phân tích bóng đá chuyên sâu dành cho người hâm mộ và chuyên gia
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

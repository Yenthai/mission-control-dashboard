import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

type AnimatedNumberProps = {
  value: number
  duration?: number
  className?: string
}

export default function AnimatedNumber({ 
  value, 
  duration = 0.8,
  className = ''
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number
    const startValue = displayValue

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      // Ease out function
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (value - startValue) * eased
      
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [value, duration])

  // Formatera värdet baserat på om det är ett heltal
  const formattedValue = value < 100 && Number.isInteger(value)
    ? Math.round(displayValue).toString()
    : displayValue.toFixed(value % 1 === 0 ? 0 : 1)

  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {formattedValue}
    </motion.span>
  )
}

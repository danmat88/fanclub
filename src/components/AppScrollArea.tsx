import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type UIEventHandler,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import styles from './AppScrollArea.module.css'

type AppScrollAreaProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  horizontalScroll?: boolean
  label?: string
  onScroll?: UIEventHandler<HTMLDivElement>
  scrollToEndKey?: string | number
  viewportRef?: RefObject<HTMLDivElement | null>
}

type ScrollMetrics = {
  horizontalOffset: number
  horizontalSize: number
  horizontalVisible: boolean
  verticalOffset: number
  verticalSize: number
  verticalVisible: boolean
}

type DragState = {
  axis: 'x' | 'y'
  pointerId: number
  startCoordinate: number
  startScroll: number
}

const emptyMetrics: ScrollMetrics = {
  horizontalOffset: 0,
  horizontalSize: 0,
  horizontalVisible: false,
  verticalOffset: 0,
  verticalSize: 0,
  verticalVisible: false,
}

const TRACK_INSET = 6
const MIN_THUMB = 30

export function AppScrollArea({
  children,
  className = '',
  contentClassName = '',
  horizontalScroll = true,
  label,
  onScroll,
  scrollToEndKey,
  viewportRef: forwardedViewportRef,
}: AppScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const frameRef = useRef<number | null>(null)
  const endScrollFrameRef = useRef<number | null>(null)
  const previousEndKeyRef = useRef<string | number | undefined>(undefined)
  const [metrics, setMetrics] = useState<ScrollMetrics>(emptyMetrics)

  const registerViewport = useCallback((viewport: HTMLDivElement | null) => {
    viewportRef.current = viewport
    if (forwardedViewportRef) forwardedViewportRef.current = viewport
  }, [forwardedViewportRef])

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const verticalTrack = Math.max(0, viewport.clientHeight - TRACK_INSET)
    const horizontalTrack = Math.max(0, viewport.clientWidth - TRACK_INSET)
    const verticalVisible = viewport.scrollHeight > viewport.clientHeight + 1
    const horizontalVisible = horizontalScroll && viewport.scrollWidth > viewport.clientWidth + 1
    const verticalSize = verticalVisible
      ? Math.min(verticalTrack, Math.max(MIN_THUMB, (viewport.clientHeight / viewport.scrollHeight) * verticalTrack))
      : 0
    const horizontalSize = horizontalVisible
      ? Math.min(horizontalTrack, Math.max(MIN_THUMB, (viewport.clientWidth / viewport.scrollWidth) * horizontalTrack))
      : 0
    const verticalTravel = Math.max(0, verticalTrack - verticalSize)
    const horizontalTravel = Math.max(0, horizontalTrack - horizontalSize)
    const verticalMax = Math.max(1, viewport.scrollHeight - viewport.clientHeight)
    const horizontalMax = Math.max(1, viewport.scrollWidth - viewport.clientWidth)

    setMetrics({
      horizontalOffset: horizontalVisible ? (viewport.scrollLeft / horizontalMax) * horizontalTravel : 0,
      horizontalSize,
      horizontalVisible,
      verticalOffset: verticalVisible ? (viewport.scrollTop / verticalMax) * verticalTravel : 0,
      verticalSize,
      verticalVisible,
    })
  }, [horizontalScroll])

  const scheduleMetrics = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      updateMetrics()
    })
  }, [updateMetrics])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    const resizeObserver = new ResizeObserver(scheduleMetrics)
    resizeObserver.observe(viewport)
    resizeObserver.observe(content)
    const mutationObserver = new MutationObserver(scheduleMetrics)
    mutationObserver.observe(content, { attributes: true, childList: true, subtree: true })
    viewport.addEventListener('scroll', scheduleMetrics, { passive: true })
    scheduleMetrics()

    return () => {
      viewport.removeEventListener('scroll', scheduleMetrics)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [scheduleMetrics])

  useLayoutEffect(() => {
    if (scrollToEndKey === undefined) return
    const viewport = viewportRef.current
    if (!viewport) return

    const behavior: ScrollBehavior = previousEndKeyRef.current === undefined ? 'auto' : 'smooth'
    previousEndKeyRef.current = scrollToEndKey
    endScrollFrameRef.current = requestAnimationFrame(() => {
      endScrollFrameRef.current = null
      viewport.scrollTo({ top: viewport.scrollHeight, behavior })
      scheduleMetrics()
    })

    return () => {
      if (endScrollFrameRef.current !== null) cancelAnimationFrame(endScrollFrameRef.current)
      endScrollFrameRef.current = null
    }
  }, [scheduleMetrics, scrollToEndKey])

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>, axis: 'x' | 'y') => {
    event.preventDefault()
    event.stopPropagation()
    const viewport = viewportRef.current
    if (!viewport) return
    dragRef.current = {
      axis,
      pointerId: event.pointerId,
      startCoordinate: axis === 'y' ? event.clientY : event.clientX,
      startScroll: axis === 'y' ? viewport.scrollTop : viewport.scrollLeft,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const dragThumb = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const viewport = viewportRef.current
    if (!drag || !viewport || drag.pointerId !== event.pointerId) return
    const vertical = drag.axis === 'y'
    const coordinate = vertical ? event.clientY : event.clientX
    const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth
    const scrollSize = vertical ? viewport.scrollHeight : viewport.scrollWidth
    const thumbSize = vertical ? metrics.verticalSize : metrics.horizontalSize
    const thumbTravel = Math.max(1, viewportSize - TRACK_INSET - thumbSize)
    const maxScroll = Math.max(0, scrollSize - viewportSize)
    const nextScroll = drag.startScroll + ((coordinate - drag.startCoordinate) / thumbTravel) * maxScroll
    if (vertical) viewport.scrollTop = nextScroll
    else viewport.scrollLeft = nextScroll
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const jumpOnTrack = (event: ReactPointerEvent<HTMLDivElement>, axis: 'x' | 'y') => {
    if (event.target !== event.currentTarget) return
    const viewport = viewportRef.current
    if (!viewport) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const vertical = axis === 'y'
    const coordinate = vertical ? event.clientY - bounds.top : event.clientX - bounds.left
    const trackSize = vertical ? bounds.height : bounds.width
    const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth
    const scrollSize = vertical ? viewport.scrollHeight : viewport.scrollWidth
    const ratio = Math.max(0, Math.min(1, coordinate / Math.max(1, trackSize)))
    const nextScroll = ratio * Math.max(0, scrollSize - viewportSize)
    viewport.scrollTo(vertical ? { top: nextScroll, behavior: 'smooth' } : { left: nextScroll, behavior: 'smooth' })
  }

  const scrollHorizontalWithWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!metrics.horizontalVisible || metrics.verticalVisible || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return
    event.preventDefault()
    event.currentTarget.scrollLeft += event.deltaY
  }

  return (
    <div className={`${styles.root} ${className}`}>
      <div
        ref={registerViewport}
        className={`${styles.viewport} ${horizontalScroll ? '' : styles.verticalOnly} ${metrics.verticalVisible ? styles.withVerticalGutter : ''} ${metrics.horizontalVisible ? styles.withHorizontalGutter : ''}`}
        tabIndex={0}
        role="region"
        aria-label={label}
        onScroll={onScroll}
        onWheel={scrollHorizontalWithWheel}
      >
        <div ref={contentRef} className={`${styles.content} ${contentClassName}`}>{children}</div>
      </div>
      {metrics.verticalVisible && (
        <div
          className={`${styles.track} ${styles.verticalTrack}`}
          style={{ bottom: metrics.horizontalVisible ? 15 : 3 }}
          onPointerDown={(event) => jumpOnTrack(event, 'y')}
        >
          <div
            className={styles.thumb}
            style={{ height: metrics.verticalSize, transform: `translate3d(0, ${metrics.verticalOffset}px, 0)` } as CSSProperties}
            onPointerDown={(event) => beginDrag(event, 'y')}
            onPointerMove={dragThumb}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </div>
      )}
      {metrics.horizontalVisible && (
        <div
          className={`${styles.track} ${styles.horizontalTrack}`}
          style={{ right: metrics.verticalVisible ? 15 : 3 }}
          onPointerDown={(event) => jumpOnTrack(event, 'x')}
        >
          <div
            className={styles.thumb}
            style={{ width: metrics.horizontalSize, transform: `translate3d(${metrics.horizontalOffset}px, 0, 0)` } as CSSProperties}
            onPointerDown={(event) => beginDrag(event, 'x')}
            onPointerMove={dragThumb}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </div>
      )}
    </div>
  )
}

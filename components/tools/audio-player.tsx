"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface AudioPlayerProps {
  audioUrl?: string
  word?: string
  pronunciation?: string
  definition?: string
  etymology?: string
  playbackSpeed?: number
  autoPlay?: boolean
  showControls?: boolean
  className?: string
}

export default function AudioPlayer({
  audioUrl,
  word,
  pronunciation,
  definition,
  etymology,
  playbackSpeed = 1.0,
  autoPlay = false,
  showControls = true,
  className = ''
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playCount, setPlayCount] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setPlayCount(prev => prev + 1)
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('ended', handleEnded)

    // Set playback speed
    audio.playbackRate = playbackSpeed

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [playbackSpeed])

  useEffect(() => {
    if (autoPlay && audioUrl && !hasError) {
      handlePlay()
    }
  }, [audioUrl, autoPlay, hasError])

  const handlePlay = async () => {
    const audio = audioRef.current
    if (!audio || hasError) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setHasError(true)
    }
  }

  const handleReplay = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    if (!isPlaying) {
      handlePlay()
    }
  }

  const handleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  // Fallback for when no audio URL is provided
  const useSpeechSynthesis = () => {
    if (!word || !('speechSynthesis' in window)) return

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.rate = playbackSpeed
    utterance.volume = isMuted ? 0 : 1
    
    // Try to use a high-quality voice
    const voices = speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Enhanced') || 
      voice.name.includes('Premium')
    ) || voices[0]
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => {
      setIsPlaying(false)
      setPlayCount(prev => prev + 1)
    }

    speechSynthesis.speak(utterance)
  }

  const handlePlayFallback = () => {
    if (audioUrl) {
      handlePlay()
    } else {
      useSpeechSynthesis()
    }
  }

  return (
    <Card className={`audio-player ${className}`}>
      <CardContent className="p-4">
        {/* Audio element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            className="hidden"
          />
        )}

        {/* Word Information */}
        {word && (
          <div className="mb-4 text-center">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              {word}
            </h3>
            {pronunciation && (
              <Badge variant="secondary" className="mb-2">
                /{pronunciation}/
              </Badge>
            )}
            {definition && (
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                {definition}
              </p>
            )}
            {etymology && (
              <p className="text-xs text-[var(--muted-foreground)] italic">
                Etymology: {etymology}
              </p>
            )}
          </div>
        )}

        {/* Audio Controls */}
        {showControls && (
          <div className="flex items-center justify-center gap-2">
            {/* Play/Pause Button */}
            <Button
              onClick={handlePlayFallback}
              disabled={isLoading}
              size="lg"
              className="rounded-full w-12 h-12"
              variant={isPlaying ? "secondary" : "default"}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : hasError ? (
                <AlertCircle className="h-5 w-5" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Replay Button */}
            <Button
              onClick={handleReplay}
              disabled={isLoading || hasError}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Mute Button */}
            {audioUrl && (
              <Button
                onClick={handleMute}
                disabled={isLoading || hasError}
                size="sm"
                variant="outline"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}

        {/* Status Information */}
        <div className="mt-4 text-center">
          {hasError && (
            <p className="text-sm text-red-500 mb-2">
              {audioUrl ? 'Audio failed to load' : 'Speech synthesis not available'}
            </p>
          )}
          
          {playCount > 0 && (
            <Badge variant="outline" className="text-xs">
              Played {playCount} time{playCount !== 1 ? 's' : ''}
            </Badge>
          )}

          {!audioUrl && word && (
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Using text-to-speech
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized component for spelling dictation
export function SpellingDictation({
  word,
  sentence,
  audioUrl,
  showWord = false,
  onPlayComplete,
  className = ''
}: {
  word: string
  sentence?: string
  audioUrl?: string
  showWord?: boolean
  onPlayComplete?: () => void
  className?: string
}) {
  const [hasPlayed, setHasPlayed] = useState(false)

  const handlePlayComplete = () => {
    setHasPlayed(true)
    onPlayComplete?.()
  }

  return (
    <div className={`spelling-dictation ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          Listen and spell the word
        </h3>
        {sentence && (
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            <em>"{sentence}"</em>
          </p>
        )}
      </div>

      <AudioPlayer
        audioUrl={audioUrl}
        word={showWord ? word : undefined}
        showControls={true}
        className="mb-4"
      />

      {hasPlayed && !showWord && (
        <div className="text-center">
          <Button
            onClick={() => setHasPlayed(false)}
            variant="outline"
            size="sm"
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  )
}

// Component for pronunciation practice
export function PronunciationPractice({
  word,
  pronunciation,
  audioUrl,
  tips,
  className = ''
}: {
  word: string
  pronunciation: string
  audioUrl?: string
  tips?: string[]
  className?: string
}) {
  return (
    <div className={`pronunciation-practice ${className}`}>
      <AudioPlayer
        audioUrl={audioUrl}
        word={word}
        pronunciation={pronunciation}
        showControls={true}
        className="mb-4"
      />

      {tips && tips.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-[var(--foreground)] mb-2">
              Pronunciation Tips:
            </h4>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

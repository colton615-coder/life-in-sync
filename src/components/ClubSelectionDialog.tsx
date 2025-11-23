import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GolfClub } from '@/lib/types'

interface ClubSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectClub: (club: GolfClub | null) => void
}

const CLUB_CATEGORIES = {
  'Woods': ['Driver', '3-Wood', '5-Wood'] as GolfClub[],
  'Hybrids': ['3-Hybrid', '4-Hybrid', '5-Hybrid'] as GolfClub[],
  'Irons': ['3-Iron', '4-Iron', '5-Iron', '6-Iron', '7-Iron', '8-Iron', '9-Iron'] as GolfClub[],
  'Wedges': ['PW', 'GW', 'SW', 'LW'] as GolfClub[],
  'Putter': ['Putter'] as GolfClub[]
}

export function ClubSelectionDialog({ open, onOpenChange, onSelectClub }: ClubSelectionDialogProps) {
  const handleSelect = (club: GolfClub) => {
    onSelectClub(club)
    onOpenChange(false)
  }

  const handleSkip = () => {
    onSelectClub(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl glass-card border-0 bg-slate-900/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">SELECT CLUB</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tag this swing analysis with the club you used
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(CLUB_CATEGORIES).map(([category, clubs]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-[0.2em]">{category}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {clubs.map((club) => (
                  <Button
                    key={club}
                    variant="outline"
                    className="h-auto py-3 px-4 text-sm bg-black/20 border-white/10 text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all font-mono"
                    onClick={() => handleSelect(club)}
                  >
                    {club}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

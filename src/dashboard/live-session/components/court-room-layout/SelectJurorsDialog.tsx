import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Hash } from 'lucide-react';
import { CaseJuror } from '@/types/court-room';

// Utility: Generate avatar
const generateAvatar = (name: string, gender: string) => {
  const seed = name.toLowerCase().replace(/\s+/g, '-');
  return `https://api.dicebear.com/7.x/${gender === 'Male' ? 'avataaars' : 'avataaars-neutral'}/svg?seed=${seed}`;
};

interface SelectJurorsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allJurors: CaseJuror[];
  onAddJurors: (jurors: CaseJuror[]) => void;
}

const SelectJurorsDialog = ({ 
  isOpen, 
  onOpenChange, 
  allJurors, 
  onAddJurors 
}: SelectJurorsDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    const selected = allJurors.filter(j => selectedIds.has(j.id));
    onAddJurors(selected);
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Jurors to Add</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-auto space-y-2 py-4">
          {allJurors.map(juror => (
            <div
              key={juror.id}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleToggle(juror.id)}
            >
              <Checkbox
                checked={selectedIds.has(juror.id)}
                onCheckedChange={() => handleToggle(juror.id)}
              />
              <Avatar className="h-10 w-10">
                <AvatarImage src={generateAvatar(juror.name, juror.gender)} />
                <AvatarFallback>{juror.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">#{juror.jurorNumber} - {juror.name}</div>
                <div className="text-sm text-gray-500">{juror.occupation}</div>
              </div>
              {juror.panelPosition !== null && juror.panelPosition !== undefined && (
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  Panel {juror.panelPosition}
                </Badge>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={selectedIds.size === 0}>
            Add {selectedIds.size} Juror{selectedIds.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectJurorsDialog;
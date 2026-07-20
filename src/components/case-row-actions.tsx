import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Receipt, Calendar, Pencil, Archive, StickyNote } from "lucide-react";

interface CaseRowActionsProps {
  onView?: () => void;
  onFees?: () => void;
  onHearing?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onNotes?: () => void;
}

export function CaseRowActions({
  onView,
  onFees,
  onHearing,
  onEdit,
  onArchive,
  onNotes,
}: CaseRowActionsProps) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open case actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4 text-sky-500" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4 text-amber-500" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onFees}>
            <Receipt className="mr-2 h-4 w-4 text-sky-500" /> Fees
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onHearing}>
            <Calendar className="mr-2 h-4 w-4 text-emerald-500" /> Hearing date
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onNotes}>
            <StickyNote className="mr-2 h-4 w-4 text-violet-500" /> Notes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4 text-rose-500" /> Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

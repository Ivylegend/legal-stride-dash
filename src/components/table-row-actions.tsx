import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface TableRowActionsProps {
  statusActions?: boolean;
  extraActions?: string[];
}

export function TableRowActions({ statusActions = true, extraActions = [] }: TableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open row actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Edit row</DropdownMenuItem>
        {statusActions && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mark pending</DropdownMenuItem>
            <DropdownMenuItem>Mark in progress</DropdownMenuItem>
            <DropdownMenuItem>Mark completed</DropdownMenuItem>
          </>
        )}
        {extraActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {extraActions.map((action) => (
              <DropdownMenuItem key={action}>{action}</DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

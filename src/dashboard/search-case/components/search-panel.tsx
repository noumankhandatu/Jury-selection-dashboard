import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchPanelProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export default function SearchPanel({ searchTerm, onSearch }: SearchPanelProps) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Find Cases</span>
        </CardTitle>
        <CardDescription className="text-white/80">Search, view, edit, and delete cases</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label htmlFor="caseSearch" className="text-gray-700">
            Search Cases
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="caseSearch"
              placeholder="Search by case number, name, type, or status..."
              className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info, Calendar, Briefcase, MapPin, User, Clock } from "lucide-react";
import type { Juror } from "./types";
import { generateAvatar, getAvailabilityColor } from "./utils";


interface JurorTableProps {
  jurors: Juror[];
  onViewDetails: (juror: Juror) => void;
}

export function JurorTable({ jurors, onViewDetails }: JurorTableProps) {
  return (
    <div className="rounded-lg border bg-white/50 backdrop-blur-sm overflow-x-auto w-[300px] lg:w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <TableHead className="font-semibold">Juror</TableHead>
            <TableHead className="font-semibold">Details</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jurors.map((juror) => {
            return (
              <TableRow key={juror.id} className="hover:bg-blue-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                        <AvatarImage src={generateAvatar(juror.name) || "/placeholder.svg"} alt={juror.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                          {juror.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{juror.name}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        {juror.age} years
                      </div>
                      {juror.jurorNumber && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 mt-1">
                          <User className="h-3 w-3 mr-1" />#{juror.jurorNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <Briefcase className="h-3 w-3 mr-2 text-blue-600" />
                      <span className="truncate max-w-32">{juror.occupation}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-3 w-3 mr-2 text-orange-600" />
                      <span className="truncate max-w-32">{juror.location}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1 text-sm">
                    <p className="truncate max-w-40">{juror.email}</p>
                    <p className="text-gray-600">{juror.phone}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <Badge className={`${getAvailabilityColor(juror.availability)} border-0 text-xs`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {juror.availability}
                    </Badge>
                    {juror.gender && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs block w-fit">
                        {juror.gender}
                      </Badge>
                    )}
                  </div>
                </TableCell>



                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(juror)}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 hover:text-blue-800"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

import { Scale, Calendar, ListChecks, Eye, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
  description: string;
  jurorTraits: string;
}

interface CaseTableProps {
  cases: Case[];
  onViewCase: (case_: Case) => void;
  onEditCase: (case_: Case) => void;
}

export default function CaseTable({ cases, onViewCase, onEditCase }: CaseTableProps) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 ">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Scale className="h-5 w-5" />
          <span>All Cases ({cases.length})</span>
        </CardTitle>
        <CardDescription className="text-white/80">Manage your case database</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="border rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="">
            {" "}
            {/* Minimum width to ensure content doesn't get too cramped */}
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-[120px]">Case Number</TableHead>
                  <TableHead className="w-[200px]">Case Name</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Created Date</TableHead>
                  <TableHead className="w-[120px]">Questions</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {cases.map((case_) => (
                    <motion.tr
                      key={case_.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">{case_.number}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={case_.name}>
                        {case_.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            case_.type === "CRIMINAL" ? "bg-red-100 text-red-700 border-red-200  " : "  bg-blue-100 text-blue-700 border-blue-200"
                          }
                        >
                          {case_.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            case_.status === "Active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : case_.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {case_.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(case_.createdDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <ListChecks className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">View to see</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewCase(case_)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditCase(case_)}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteCase(case_.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {cases.length === 0 && (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No cases available
                      </TableCell>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

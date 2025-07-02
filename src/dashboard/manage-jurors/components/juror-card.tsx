import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Briefcase, GraduationCap, MapPin, Info, User, Award, AlertTriangle } from "lucide-react";
import type { Juror } from "./types";
import { generateAvatar } from "./utils";
import { itemVariants } from "@/utils/fn";
import { BiasGauge } from "@/components/shared/bias-gauge";

interface JurorCardProps {
  juror: Juror;
  onViewDetails: (juror: Juror) => void;
  isHighlighted?: boolean;
}

export function JurorCard({ juror, onViewDetails, isHighlighted = false }: JurorCardProps) {
  // When struck, juror becomes high risk, otherwise use original bias
  const effectiveBiasStatus = juror.isStrikedOut ? "high" : juror.biasStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
    >
      <Card
        className={`relative h-full bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden cursor-pointer group-hover:scale-[1.02] ${
          isHighlighted
            ? "ring-2 ring-red-400 shadow-red-200/50 bg-gradient-to-br from-red-50 via-white to-red-50/30"
            : "hover:shadow-blue-200/50 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden cursor-pointer group-hover:scale-[1.02]"
        }`}
        onClick={() => onViewDetails(juror)}
      >
        {/* Gradient Border */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            isHighlighted ? "from-red-400 via-pink-400 to-red-500" : "from-blue-400 via-indigo-500 to-purple-500"
          } rounded-lg`}
        >
          <div className="absolute inset-[1px] bg-white rounded-lg" />
        </div>

        {/* Strike Badge - Top Right */}
        {juror.isStrikedOut && (
          <div className="absolute top-3 right-3 z-30">
            <motion.div
              variants={itemVariants}
              className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">STRUCK</span>
              <span className="sm:hidden">!</span>
            </motion.div>
          </div>
        )}

        <div className="relative z-20">
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="relative">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-3 border-white shadow-xl ring-2 ring-blue-100 transition-all duration-300 group-hover:ring-blue-200">
                      <AvatarImage src={generateAvatar(juror.name) || "/placeholder.svg"} alt={juror.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm sm:text-lg font-bold">
                        {juror.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {juror.availability === "Available" ? (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
                      ) : juror.availability === "Limited" ? (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full" />
                      ) : (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-lg text-gray-900 truncate mb-1 group-hover:text-blue-700 transition-colors">
                    {juror.name}
                  </h3>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">{juror.age} years old</span>
                  </div>
                  {juror.jurorNumber && (
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                        <User className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">#</span>
                        {juror.jurorNumber}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 pt-0 pb-4 sm:pb-6">
            {/* Professional Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-xs sm:text-sm text-gray-700 bg-blue-50/50 rounded-lg p-2 sm:p-3 transition-colors group-hover:bg-blue-100/50">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{juror.occupation || "Not Applicable"}</p>
                  <p className="text-xs text-gray-600 hidden sm:block">Occupation</p>
                </div>
              </div>

              <div className="flex items-center text-xs sm:text-sm text-gray-700 bg-green-50/50 rounded-lg p-2 sm:p-3 transition-colors group-hover:bg-green-100/50">
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{juror.education}</p>
                  <p className="text-xs text-gray-600 hidden sm:block">Education</p>
                </div>
              </div>

              <div className="flex items-center text-xs sm:text-sm text-gray-700 bg-orange-50/50 rounded-lg p-2 sm:p-3 transition-colors group-hover:bg-orange-100/50">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-orange-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{juror.location}</p>
                  <p className="text-xs text-gray-600 hidden sm:block">Location</p>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-100">
              <div className="flex items-center mb-2">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600" />
                <p className="text-xs sm:text-sm font-semibold text-blue-900">Jury Experience</p>
              </div>
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed line-clamp-2 sm:line-clamp-none">{juror.experience}</p>
            </div>

            {/* Bias Gauge Display */}
            <div className="flex justify-center pt-2 sm:pt-3 border-t border-gray-100">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <BiasGauge biasStatus={effectiveBiasStatus} size="md" isHighlighted={isHighlighted} />
                <p className="text-xs text-gray-600 font-medium hidden sm:block">Risk Assessment</p>
              </div>
            </div>

            {/* View Details Button */}
            <div className="pt-2 sm:pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 hover:text-blue-800 font-medium transition-all duration-300 group-hover:shadow-md text-xs sm:text-sm h-8 sm:h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(juror);
                }}
              >
                <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Full Details</span>
                <span className="sm:hidden">Details</span>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

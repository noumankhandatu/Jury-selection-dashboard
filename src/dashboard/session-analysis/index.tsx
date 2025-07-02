/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, MessageCircle, Brain, ThumbsUp, ThumbsDown, Minus, Grid3X3, List, Clock, Filter, X } from "lucide-react";
import { JurorCard } from "../manage-jurors/components/juror-card";
import { BiasGauge } from "@/components/shared/bias-gauge";
import { mockCases, mockSessionData } from "./raw";
import CardHeaderTag from "@/components/shared/card-header";
import TagBtnSession from "@/components/shared/tag/tag-btn-session";

export default function SessionAnalysisPage() {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedJuror, setSelectedJuror] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter states
  const [recommendationFilter, setRecommendationFilter] = useState<string>("all");

  const selectedCaseData = selectedCase ? mockSessionData[selectedCase.id as keyof typeof mockSessionData] : null;

  // Apply filters and sort jurors
  const filteredAndSortedJurors =
    selectedCaseData?.jurors
      .filter((juror) => {
        // Recommendation filter only
        if (recommendationFilter !== "all" && juror.aiRecommendation !== recommendationFilter) {
          return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const order: any = { favorable: 0, neutral: 1, unfavorable: 2 };
        return order[a.aiRecommendation] - order[b.aiRecommendation];
      }) || [];

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "favorable":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case "unfavorable":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      case "neutral":
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    const colors = {
      favorable: "bg-green-100 text-green-800 border-green-200",
      unfavorable: "bg-red-100 text-red-800 border-red-200",
      neutral: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return (
      <Badge className={`${colors[recommendation as keyof typeof colors] || colors.neutral} flex items-center text-xs`}>
        {getRecommendationIcon(recommendation)}
        <span className="ml-1 capitalize">{recommendation}</span>
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    const color = confidence >= 90 ? "bg-green-100 text-green-800" : confidence >= 80 ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800";
    return <Badge className={`${color} text-xs`}>{confidence}%</Badge>;
  };

  const getAnswerIcon = (type: string, answer: string) => {
    if (type === "boolean") {
      return answer.toLowerCase().includes("yes") || answer.toLowerCase().includes("true") ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    }
    return <MessageCircle className="h-4 w-4 text-blue-500" />;
  };

  const handleViewDetails = (juror: any) => {
    setSelectedJuror(juror);
    setIsDetailsOpen(true);
  };

  const exportAnalysis = () => {
    if (!selectedCaseData) return;

    const exportData = {
      case: selectedCaseData.title,
      aiAnalysis: selectedCaseData.aiAnalysis,
      jurors: filteredAndSortedJurors.map((juror) => ({
        name: juror.name,
        recommendation: juror.aiRecommendation,
        confidence: juror.aiConfidence,
        reasoning: juror.aiReasoning,
        riskLevel: juror.overallRisk,
        responseCount: juror.responses.length,
      })),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jury-analysis-${selectedCase.id}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setRecommendationFilter("all");
  };

  const hasActiveFilters = recommendationFilter !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <TagBtnSession selectedCaseData={selectedCaseData} exportAnalysis={exportAnalysis} />

      {/* Case Selection */}
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden mt-5">
        <CardHeaderTag title="Select Case for AI Analysis" description="Choose a case to get AI-powered juror recommendations" Icon={Brain} />

        <CardContent className="p-4 sm:p-6">
          <Select
            value={selectedCase?.id || ""}
            onValueChange={(value) => {
              const case_ = mockCases.find((c) => c.id === value);
              setSelectedCase(case_ || null);
              // Reset filter when changing cases
              setRecommendationFilter("all");
            }}
          >
            <SelectTrigger className="w-full bg-white/70 backdrop-blur-md border border-gray-300 hover:border-blue-400 transition-colors duration-200">
              <SelectValue placeholder="Search by case number or name..." />
            </SelectTrigger>
            <SelectContent className="bg-white/80 backdrop-blur-md border border-gray-300">
              {mockCases.map((case_) => (
                <SelectItem key={case_.id} value={case_.id}>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{case_.number}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <div className="h-[40px]" />

      {selectedCaseData && (
        <>
          {/* AI Analysis Summary */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Analysis Summary
                <Badge className="bg-blue-100 text-blue-800">{selectedCaseData.aiAnalysis.confidence}% Overall Confidence</Badge>
              </CardTitle>
              <CardDescription>{selectedCaseData.aiAnalysis.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedCaseData.aiAnalysis.totalJurors}</div>
                  <div className="text-sm text-gray-500">Total Jurors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedCaseData.aiAnalysis.favorable}</div>
                  <div className="text-sm text-gray-500">Favorable</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedCaseData.aiAnalysis.unfavorable}</div>
                  <div className="text-sm text-gray-500">Unfavorable</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{selectedCaseData.aiAnalysis.neutral}</div>
                  <div className="text-sm text-gray-500">Neutral</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="h-[40px]" />

          {/* Filters */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5 text-blue-600" />
                Filter Jurors
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="ml-auto text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {/* AI Recommendation Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">AI Recommendation</label>
                  <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Recommendations</SelectItem>
                      <SelectItem value="favorable">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          Favorable
                        </div>
                      </SelectItem>
                      <SelectItem value="neutral">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-yellow-600" />
                          Neutral
                        </div>
                      </SelectItem>
                      <SelectItem value="unfavorable">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          Unfavorable
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Active filter:</span>
                    {recommendationFilter !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getRecommendationIcon(recommendationFilter)}
                        {recommendationFilter}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setRecommendationFilter("all")} />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="h-[40px]" />

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              AI Juror Recommendations ({filteredAndSortedJurors.length})
              {hasActiveFilters && <span className="text-sm text-gray-500 ml-2">of {selectedCaseData.jurors.length} total</span>}
            </h3>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          </div>

          {/* Jurors Display */}
          {filteredAndSortedJurors.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedJurors.map((juror) => (
                  <div key={juror.id} className="relative">
                    {/* AI Recommendation Overlay */}
                    <div className="absolute top-3 right-3 z-40">{getRecommendationBadge(juror.aiRecommendation)}</div>
                    <JurorCard juror={juror} onViewDetails={handleViewDetails} isHighlighted={juror.aiRecommendation === "unfavorable"} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-white/50 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <TableHead className="font-semibold">Juror</TableHead>
                      <TableHead className="font-semibold">AI Recommendation</TableHead>
                      <TableHead className="font-semibold">Risk Level</TableHead>
                      <TableHead className="font-semibold">Confidence</TableHead>
                      <TableHead className="font-semibold">Responses</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedJurors.map((juror) => (
                      <TableRow key={juror.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                {juror.name
                                  .split(" ")
                                  .map((n: any[]) => n[0])
                                  .join("")}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{juror.name}</p>
                              <div className="text-sm text-gray-600">
                                {juror.age} years • {juror.occupation}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{getRecommendationBadge(juror.aiRecommendation)}</TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <BiasGauge biasStatus={juror.biasStatus} size="sm" />
                            <span className="text-sm capitalize">{juror.biasStatus} risk</span>
                          </div>
                        </TableCell>

                        <TableCell>{getConfidenceBadge(juror.aiConfidence)}</TableCell>

                        <TableCell>
                          <span className="text-sm">{juror.responses.length} responses</span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(juror)}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 hover:text-blue-800"
                          >
                            Q&A Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
                <Filter className="h-12 w-12 text-gray-400" />
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-gray-600">No jurors match your filters</p>
                  <p className="text-gray-500">Try adjusting your filter criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      <div className="h-[40px]" />

      {!selectedCase && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <Brain className="h-16 w-16 text-gray-400" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-600">AI-Powered Jury Analysis</p>
              <p className="text-gray-500">Select a case to get intelligent recommendations based on live session responses</p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Juror Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              AI Analysis & Session Q&A
            </DialogTitle>
            <DialogDescription>Detailed AI analysis and live session responses for {selectedJuror?.name}</DialogDescription>
          </DialogHeader>

          {selectedJuror && (
            <div className="space-y-6">
              {/* Juror Header */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                  {selectedJuror.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{selectedJuror.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      {selectedJuror.age} years old • {selectedJuror.occupation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getRecommendationBadge(selectedJuror.aiRecommendation)}
                    {getConfidenceBadge(selectedJuror.aiConfidence)}
                  </div>
                </div>
                <div className="text-center">
                  <BiasGauge biasStatus={selectedJuror.biasStatus} size="lg" />
                </div>
              </div>

              {/* AI Analysis */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI Recommendation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 leading-relaxed">{selectedJuror.aiReasoning}</p>
                </CardContent>
              </Card>

              {/* Session Responses */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Session Q&A ({selectedJuror.responses.length} responses)</CardTitle>
                  <CardDescription>Questions and answers from the live jury selection session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedJuror.responses.map((response: any, index: number) => (
                      <Card
                        key={response.id}
                        className={`border-l-4 ${
                          response.riskLevel === "high"
                            ? "border-l-red-500"
                            : response.riskLevel === "moderate"
                            ? "border-l-yellow-500"
                            : "border-l-green-500"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {new Date(response.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <Badge
                                className={`${
                                  response.riskLevel === "high"
                                    ? "bg-red-100 text-red-800"
                                    : response.riskLevel === "moderate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                } text-xs`}
                              >
                                {response.riskLevel} risk
                              </Badge>
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-2">{response.question}</p>
                              <div className="flex items-center gap-2 mb-2">
                                {getAnswerIcon(response.type, response.answer)}
                                <span className="text-sm font-medium">{response.answer}</span>
                              </div>
                            </div>

                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Risk Analysis:</p>
                              <p className="text-sm">{response.riskReason}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

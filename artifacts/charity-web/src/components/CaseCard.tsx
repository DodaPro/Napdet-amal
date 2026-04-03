import { Link } from "wouter";
import { Case } from "@workspace/api-client-react";
import { formatEGP, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, Activity, MapPin } from "lucide-react";

interface CaseCardProps {
  item: Case;
}

export default function CaseCard({ item }: CaseCardProps) {
  const percentage = Math.min(Math.round((item.soldShares / item.totalShares) * 100), 100);
  const sharesLeft = item.totalShares - item.soldShares;
  const isFunded = item.status === "funded";

  const urgencyColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
  };

  const urgencyLabels = {
    critical: "حرجة جداً",
    high: "عاجلة",
    medium: "متوسطة",
  };

  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-300 group flex flex-col h-full border-card-border bg-card">
      <Link href={`/cases/${item.id}`} className="block relative cursor-pointer outline-none ring-primary focus-visible:ring-2">
        <AspectRatio ratio={4 / 3}>
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground transition-transform duration-500 group-hover:scale-105">
              <Activity className="w-12 h-12 opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </AspectRatio>
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {item.status === "active" && (
             <Badge className={urgencyColors[item.urgencyLevel] || "bg-primary text-primary-foreground"} variant="default">
               <Clock className="w-3 h-3 ml-1" />
               {urgencyLabels[item.urgencyLevel]}
             </Badge>
          )}
          {isFunded && (
             <Badge className="bg-success text-success-foreground" variant="default">
               مكتملة
             </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="p-5 pb-0 flex-none">
        <div className="flex justify-between items-start gap-4 mb-2">
          <Link href={`/cases/${item.id}`} className="hover:text-primary transition-colors outline-none focus-visible:underline">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground">{item.title}</h3>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-primary/70" />
            <span>{item.patientName} ({item.patientAge} سنة)</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-primary/70" />
            <span className="line-clamp-1">{item.hospital}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-end">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-end text-sm">
              <span className="font-medium text-foreground">
                {formatEGP(item.collectedAmount)}
              </span>
              <span className="text-muted-foreground">
                من {formatEGP(item.targetAmount)}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-t border-border/50 text-center">
             <div className="flex flex-col items-center">
               <span className="text-2xl font-bold text-foreground">
                 {isFunded ? "0" : formatNumber(sharesLeft)}
               </span>
               <span className="text-xs text-muted-foreground mt-1">سهم متبقي</span>
             </div>
             <div className="flex flex-col items-center border-r border-border/50">
               <span className="text-2xl font-bold text-primary">
                 {formatEGP(item.sharePrice)}
               </span>
               <span className="text-xs text-muted-foreground mt-1">قيمة السهم</span>
             </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto">
        <Link 
          href={`/cases/${item.id}`} 
          className="w-full inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isFunded ? "عرض التفاصيل" : "تبرع الآن"}
        </Link>
      </CardFooter>
    </Card>
  );
}

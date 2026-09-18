import {
  GraduationCap, Trophy, CalendarDays, Microscope, Compass, Users, School, Wrench, FlaskConical,
  Sparkles, Heart, Target, Globe2, Lightbulb, Handshake, Laptop, BookOpen, Rocket, Megaphone, ShieldCheck,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/content/data";

const map: Record<IconName, React.ComponentType<LucideProps>> = {
  graduation: GraduationCap,
  trophy: Trophy,
  calendar: CalendarDays,
  microscope: Microscope,
  compass: Compass,
  users: Users,
  school: School,
  wrench: Wrench,
  flask: FlaskConical,
  sparkles: Sparkles,
  heart: Heart,
  target: Target,
  globe: Globe2,
  lightbulb: Lightbulb,
  handshake: Handshake,
  laptop: Laptop,
  book: BookOpen,
  rocket: Rocket,
  megaphone: Megaphone,
  shield: ShieldCheck,
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const C = map[name];
  return <C {...props} />;
}

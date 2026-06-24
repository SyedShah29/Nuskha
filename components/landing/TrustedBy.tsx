import { Activity, Heart, ShieldPlus, Stethoscope } from "lucide-react";

const logos = [
  { icon: Activity, name: "MedCore", subtitle: "Hospital" },
  { icon: Heart, name: "Greenline", subtitle: "Health System" },
  { icon: ShieldPlus, name: "LifeCare", subtitle: "Institute" },
  { icon: Stethoscope, name: "NovaMed", subtitle: "Network" },
];

export const TrustedBy = () => {
  return (
    <section className="py-12 bg-white border-y border-[#2d5016]/8">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
          <p className="text-xs font-bold text-[#1a2e1a]/35 uppercase tracking-widest whitespace-nowrap">
            Trusted by leading
            <br />
            <span className="text-[#2d5016]/50">healthcare organizations</span>
          </p>

          <div className="flex-1 flex flex-wrap items-center justify-center md:justify-around gap-10 opacity-50">
            {logos.map(({ icon: Icon, name, subtitle }) => (
              <div key={name} className="flex items-center gap-2.5 text-[#1a2e1a]">
                <Icon className="w-5 h-5 text-[#2d5016]" strokeWidth={1.5} />
                <div>
                  <span className="text-sm font-bold tracking-tight">{name}</span>
                  <span className="text-[9px] font-medium uppercase tracking-widest text-[#1a2e1a]/50 block -mt-0.5">
                    {subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

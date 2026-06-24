import Link from "next/link";

const footerLinks = {
  Product: ["Features", "For Patients", "For Doctors", "Pricing"],
  Company: ["About Us", "Careers", "Press", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "HIPAA Compliance"],
};

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[rgba(15,17,23,0.04)] pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-xl bg-[#0F1117] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12 Q12 4 21 12" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 12 L7 12 L8.5 8 L10 16 L11.5 12 L20 12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="3" cy="12" r="1.2" fill="#059669"/>
                </svg>
              </div>
              <span className="font-bold text-[#0F1117]">Nuskha</span>
            </Link>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-xs mb-8">
              Pakistan's first multi-agent clinical assistant, bridging the gap between symptoms and professional care in both Urdu and English.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border border-[rgba(15,17,23,0.08)] flex items-center justify-center hover:bg-[#F6F7F9] transition-colors cursor-pointer" />
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-[#0F1117] mb-6">{category}</h4>
              <ul className="flex flex-col gap-4">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-[#6B7280] hover:text-[#059669] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="pt-8 border-t border-[rgba(15,17,23,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#6B7280]">
            © {new Date().getFullYear()} Nuskha Health. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[#6B7280] font-mono-data">
            <span>Rescue: 1122</span>
            <span>Edhi: 115</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


interface FeaturesSectionProps {}

export default function FeaturesSection({}: FeaturesSectionProps) {
  return (
    <section id="features" className="px-6 md:px-16 pt-12 pb-0 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">還有多少學分可以畢業？</h2>
      <p className="mt-3 text-gray-500 max-w-md mx-auto">
        立即登入，查看自己距離畢業門檻還有多少哩程<br /> 輕易掌握學分，確保順利畢業
      </p>
    </section>
  );
}

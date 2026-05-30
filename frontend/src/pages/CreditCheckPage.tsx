import Card from '../components/ui/Card';

export default function CreditCheckPage() {
  return (
    <Card className="px-6 py-8">
      <p className="text-sm font-medium text-gray-500">學分檢核</p>
      <h2 className="mt-1 text-3xl font-bold text-gray-900">學分檢核功能建置中</h2>
      <p className="mt-4 text-gray-500">
        之後系統會根據 111 入學資訊科學系學士班畢業規則，自動檢查：
      </p>
      <ul className="mt-5 space-y-2 text-gray-600">
        <li>總畢業學分 128 學分</li>
        <li>專業必修 39 學分</li>
        <li>專業群修 12 學分</li>
        <li>缺少的必修課程</li>
        <li>各類別已完成與未完成狀態</li>
      </ul>
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, DollarSign } from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import { Service } from '../../types';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ServiceSelection: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { selectedService, setSelectedService } = useReservation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('id');

                if (error) throw error;
                setServices(data || []);
            } catch (err) {
                setError('サービスの読み込みに失敗しました。もう一度お試しください。');
                console.error('サービス取得エラー:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleContinue = () => {
        if (selectedService) {
            navigate('/reservation/datetime');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-gray-300 rounded mb-4"></div>
                    <div className="h-24 w-48 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>再読み込み</Button>
            </div>
        );
    }

    return (
        <div className="py-8 animate-fadeIn">
            <h2 className="text-2xl font-serif font-bold text-purple-900 mb-6 text-center">
                メニューを選択してください
            </h2>

            {services.length === 0 ? (
                <p className="text-center text-gray-600">現在、利用可能なサービスはありません。</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <Card
                            key={service.id}
                            selected={selectedService?.id === service.id}
                            onClick={() => {
                                setSelectedService(service);
                            }}
                        >

                            <div className="p-6">
                                {service.image_url ? (
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="w-full h-48 object-cover rounded-md mb-4"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-pink-100 rounded-md flex items-center justify-center mb-4">
                                        <Sparkles className="w-12 h-12 text-purple-400" />
                                    </div>
                                )}

                                <h3 className="font-serif text-xl font-bold text-purple-900 mb-2">
                                    {service.name}
                                </h3>

                                <p className="text-gray-600 mb-4">
                                    {service.description}
                                </p>

                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center text-purple-700">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{service.duration} 分</span>
                                    </div>

                                    <div className="flex items-center font-medium text-purple-900">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        <span>¥{service.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-8 flex justify-center">
                <Button
                    onClick={handleContinue}
                    disabled={!selectedService}
                    className="w-full md:w-auto"
                >
                    次へ進む
                </Button>
            </div>
        </div>
    );
};

export default ServiceSelection;

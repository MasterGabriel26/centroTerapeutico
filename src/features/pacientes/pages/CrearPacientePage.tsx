import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/TextArea';
import { Select } from '../../../components/ui/Select';
import { usePacientes } from '../hooks/usePacientes';
import { CrearPacienteData } from '../types/paciente';
import {
    User, Droplet, Users, Heart, Save, Plus, Minus,
    ArrowLeft, BookOpen, Activity, UserPlus, Briefcase, Target
} from 'lucide-react';
import { format } from 'date-fns';

const CrearPacientePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { createPaciente, editPaciente, getPaciente, loading } = usePacientes();

    const isEditing = Boolean(id);
    const [currentStep, setCurrentStep] = useState(1);
    const [loadingData, setLoadingData] = useState(false);
    
    const [formData, setFormData] = useState<CrearPacienteData>({
        nombre_completo: "",
        documento: "",
        fecha_nacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
        voluntario: false,
        fecha_entrevista: format(new Date(), 'yyyy-MM-dd'),
        numero_expediente: "",
        edad: 0,
        sexo: "masculino",
        estado_civil: "soltero",
        escolaridad: "",
        desempleado: false,
        tiempo_desempleo: "",
        depende_economicamente: false,
        de_quien_depende: "",
        alguien_depende_de_usted: false,
        quien_depende: "",
        personas_con_vive: "",
        tiene_pareja: false,
        tiempo_relacion: "",
        fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
        motivo_ingreso: "",
        evaluador: "",
        quien_lo_trajo: {
            nombre: "",
            parentesco: "",
            telefono: "",
            direccion: ""
        },
        sustancias_consumidas: [],
        estado_nutricional: {
            ultima_comida: "",
            apetito: "normal",
            alergias_alimenticias: "",
            problemas_digestivos: "",
            peso_actual: 0,
            talla: 0
        },
        historial_medico: {
            enfermedades_previas: "",
            medicamentos_actuales: "",
            alergias_medicamentos: "",
            hospitalizaciones_previas: "",
            cirugias_previas: ""
        },
        estado_psicologico: {
            intentos_suicidas: 0,
            tratamientos_psiquiatricos_previos: "",
            diagnostico_psiquiatrico: "",
            medicacion_psiquiatrica: ""
        },
        motivo_consulta: "",
        expectativas_tratamiento: "",
        apoyo_familiar: "medio",
        entrevista_inicial: {}
    });

    const [nuevaSustancia, setNuevaSustancia] = useState({
        sustancia: "",
        frecuencia: "diario",
        edad_inicio: 0,
        via_administracion: "fumada",
        cantidad_aproximada: "",
        ultimo_consumo: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showHistorialMedico, setShowHistorialMedico] = useState(false);
    const [showHistorialPsiquiatrico, setShowHistorialPsiquiatrico] = useState(false);

    useEffect(() => {
        const loadPacienteData = async () => {
            if (isEditing && id) {
                setLoadingData(true);
                try {
                    const paciente = await getPaciente(id);
                    if (paciente) {
                        setFormData(prev => ({
                            ...prev,
                            ...paciente,
                            fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
                            motivo_ingreso: "",
                            entrevista_inicial: paciente.entrevista_inicial || {}
                        }));
                        setShowHistorialMedico(!!paciente.historial_medico?.enfermedades_previas || 
                                            !!paciente.historial_medico?.medicamentos_actuales);
                        setShowHistorialPsiquiatrico(!!paciente.estado_psicologico?.tratamientos_psiquiatricos_previos ||
                                                   !!paciente.estado_psicologico?.diagnostico_psiquiatrico);
                    } else {
                        navigate('/pacientes');
                    }
                } catch (error) {
                    console.error("Error al cargar paciente:", error);
                    navigate('/pacientes');
                } finally {
                    setLoadingData(false);
                }
            }
        };
        loadPacienteData();
    }, [id, isEditing, getPaciente, navigate]);

    useEffect(() => {
        if (formData.fecha_nacimiento) {
            const hoy = new Date();
            const nacimiento = new Date(formData.fecha_nacimiento);
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();

            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad--;
            }
            setFormData(prev => ({ ...prev, edad }));
        }
    }, [formData.fecha_nacimiento]);

    useEffect(() => {
        if (!isEditing && !formData.numero_expediente) {
            const fecha = new Date();
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

            setFormData(prev => ({
                ...prev,
                numero_expediente: `EXP-${año}${mes}${dia}-${random}`
            }));
        }
    }, [isEditing, formData.numero_expediente]);

    useEffect(() => {
        if (formData.estado_nutricional.peso_actual && formData.estado_nutricional.talla) {
            const tallaMetros = formData.estado_nutricional.talla / 100;
            const imc = formData.estado_nutricional.peso_actual / (tallaMetros * tallaMetros);
            setFormData(prev => ({
                ...prev,
                estado_nutricional: {
                    ...prev.estado_nutricional,
                    imc: parseFloat(imc.toFixed(2))
                }
            }));
        }
    }, [formData.estado_nutricional.peso_actual, formData.estado_nutricional.talla]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof CrearPacienteData],
                    [child]: type === "checkbox" ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };
    
    const handleEntrevistaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            entrevista_inicial: {
                ...prev.entrevista_inicial,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleSustanciaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNuevaSustancia(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addSustancia = () => {
        if (!nuevaSustancia.sustancia) return;

        setFormData(prev => ({
            ...prev,
            sustancias_consumidas: [...prev.sustancias_consumidas, nuevaSustancia]
        }));

        setNuevaSustancia({
            sustancia: "",
            frecuencia: "diario",
            edad_inicio: 0,
            via_administracion: "fumada",
            cantidad_aproximada: "",
            ultimo_consumo: ""
        });
    };

    const removeSustancia = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sustancias_consumidas: prev.sustancias_consumidas.filter((_, i) => i !== index)
        }));
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.nombre_completo.trim()) newErrors.nombre_completo = "Nombre completo es requerido";
            if (!formData.documento.trim()) newErrors.documento = "Documento es requerido";
            if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Fecha de nacimiento es requerida";
        }

        if (step === 2) {
            if (formData.sustancias_consumidas.length === 0) newErrors.sustancias = "Debe registrar al menos una sustancia";
        }
        
        if (step === 4) {
             if (!formData.estado_nutricional.peso_actual) newErrors['estado_nutricional.peso_actual'] = "Peso es requerido";
            if (!formData.estado_nutricional.talla) newErrors['estado_nutricional.talla'] = "Talla es requerida";
        }

        if (step === 6 && !isEditing) {
            if (!formData.motivo_ingreso.trim()) newErrors.motivo_ingreso = "Motivo de ingreso es requerido";
            if (!formData.evaluador.trim()) newErrors.evaluador = "Evaluador es requerido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        let result;
        if (isEditing && id) {
            result = await editPaciente(id, formData);
        } else {
            result = await createPaciente(formData);
        }

        if (result) {
            navigate('/pacientes');
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando información del paciente...</p>
                </div>
            </div>
        );
    }

    const steps = [
        { number: 1, title: "Datos Personales", icon: User },
        { number: 2, title: "Historial de Consumo", icon: Droplet },
        { number: 3, title: "Entorno Socio-Familiar", icon: Users },
        { number: 4, title: "Salud y Antecedentes", icon: Heart },
        { number: 5, title: "Disposición y Metas", icon: Target },
        { number: 6, title: "Información de Ingreso", icon: UserPlus }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <Button variant="outline" onClick={() => navigate('/pacientes')} className="mb-4 flex items-center gap-2">
                        <ArrowLeft size={18} /> Volver a Pacientes
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditing ? "Editar Paciente" : "Registrar Nuevo Paciente"}
                    </h1>
                    <p className="text-gray-600">
                        Complete toda la información requerida para el ingreso a la clínica
                    </p>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${currentStep >= step.number ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-300'}`}>
                                    <step.icon size={20} />
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>Paso {step.number}</p>
                                    <p className={`text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 ml-6 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="p-8">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6"><div className="bg-blue-100 p-2 rounded-lg"><User className="text-blue-600" size={24} /></div><h2 className="text-xl font-semibold text-gray-900">Datos Personales</h2></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2"><Input name="nombre_completo" label="Nombre completo" value={formData.nombre_completo} onChange={handleChange} error={errors.nombre_completo} required /></div>
                                <Input name="documento" label="Número de documento" value={formData.documento} onChange={handleChange} error={errors.documento} required />
                                <Input name="fecha_nacimiento" label="Fecha de nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} error={errors.fecha_nacimiento} required max={format(new Date(), 'yyyy-MM-dd')} />
                                <Input name="telefono" label="Teléfono" value={formData.telefono} onChange={handleChange} error={errors.telefono} />
                                <Input name="email" label="Correo electrónico (opcional)" type="email" value={formData.email} onChange={handleChange} />
                                <Input name="direccion" label="Dirección completa (opcional)" value={formData.direccion} onChange={handleChange} />
                                <Select name="sexo" label="Sexo" value={formData.sexo} onChange={handleChange} options={[{ value: "masculino", label: "Masculino" }, { value: "femenino", label: "Femenino" }, { value: "otro", label: "Otro" }]} />
                                <Select name="estado_civil" label="Estado civil" value={formData.estado_civil} onChange={handleChange} options={[{ value: "soltero", label: "Soltero/a" }, { value: "casado", label: "Casado/a" }, { value: "divorciado", label: "Divorciado/a" }, { value: "viudo", label: "Viudo/a" }, { value: "union_libre", label: "Unión libre" }]} />
                                <Input name="escolaridad" label="Escolaridad (opcional)" value={formData.escolaridad} onChange={handleChange} />
                                <div className="flex items-center space-x-2"><input type="checkbox" id="tiene_pareja" name="tiene_pareja" checked={formData.tiene_pareja} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><label htmlFor="tiene_pareja" className="text-sm font-medium text-gray-700">¿Tiene pareja actualmente?</label></div>
                                {formData.tiene_pareja && (<Input name="tiempo_relacion" label="Tiempo de relación (opcional)" value={formData.tiempo_relacion} onChange={handleChange} />)}
                                <div className="flex items-center space-x-2"><input type="checkbox" id="desempleado" name="desempleado" checked={formData.desempleado} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><label htmlFor="desempleado" className="text-sm font-medium text-gray-700">¿Se encuentra desempleado actualmente?</label></div>
                                {formData.desempleado && (<Input name="tiempo_desempleo" label="Tiempo de desempleo (opcional)" value={formData.tiempo_desempleo} onChange={handleChange} />)}
                                <div className="flex items-center space-x-2"><input type="checkbox" id="depende_economicamente" name="depende_economicamente" checked={formData.depende_economicamente} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><label htmlFor="depende_economicamente" className="text-sm font-medium text-gray-700">¿Depende económicamente de alguien?</label></div>
                                {formData.depende_economicamente && (<Input name="de_quien_depende" label="De quién depende (opcional)" value={formData.de_quien_depende} onChange={handleChange} />)}
                                <div className="flex items-center space-x-2"><input type="checkbox" id="alguien_depende_de_usted" name="alguien_depende_de_usted" checked={formData.alguien_depende_de_usted} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><label htmlFor="alguien_depende_de_usted" className="text-sm font-medium text-gray-700">¿Alguien depende económicamente de usted?</label></div>
                                {formData.alguien_depende_de_usted && (<Input name="quien_depende" label="Quién depende de usted (opcional)" value={formData.quien_depende} onChange={handleChange} />)}
                                <div className="md:col-span-2"><TextArea name="personas_con_vive" label="Personas con las que vive (opcional)" value={formData.personas_con_vive} onChange={handleChange} rows={3} /></div>
                            
                            </div>
                            
                              <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <UserPlus size={20} /> Información de la persona que lo trajo
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        name="quien_lo_trajo.nombre"
                                        label="Nombre completo"
                                        value={formData.quien_lo_trajo?.nombre || ""}
                                        onChange={handleChange}
                                        error={errors['quien_lo_trajo.nombre']}
                                        required
                                    />

                                    <Input
                                        name="quien_lo_trajo.parentesco"
                                        label="Parentesco"
                                        value={formData.quien_lo_trajo?.parentesco || ""}
                                        onChange={handleChange}
                                        error={errors['quien_lo_trajo.parentesco']}
                                        required
                                    />

                                    <Input
                                        name="quien_lo_trajo.telefono"
                                        label="Teléfono"
                                        value={formData.quien_lo_trajo?.telefono || ""}
                                        onChange={handleChange}
                                        error={errors['quien_lo_trajo.telefono']}
                                        required
                                    />

                                    <Input
                                        name="quien_lo_trajo.direccion"
                                        label="Dirección (opcional)"
                                        value={formData.quien_lo_trajo?.direccion || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                     
                         


                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-6"><div className="bg-purple-100 p-2 rounded-lg"><Droplet className="text-purple-600" size={24} /></div><h2 className="text-xl font-semibold text-gray-900">Historial y Detalles de Consumo</h2></div>
                            
                            <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Sustancias Consumidas</h3>
                                {errors.sustancias && (<p className="text-red-500 text-sm mb-4">{errors.sustancias}</p>)}
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                                    <div className="md:col-span-2"><Input name="sustancia" label="Sustancia" value={nuevaSustancia.sustancia} onChange={handleSustanciaChange} /></div>
                                    <Select name="frecuencia" label="Frecuencia" value={nuevaSustancia.frecuencia} onChange={handleSustanciaChange} options={[{ value: "diario", label: "Diario" }, { value: "semanal", label: "Semanal" }, { value: "ocasional", label: "Ocasional" }, { value: "ex-consumidor", label: "Ex-consumidor" }]} />
                                    <Input name="edad_inicio" label="Edad inicio" type="number" value={nuevaSustancia.edad_inicio} onChange={handleSustanciaChange} />
                                    <Select name="via_administracion" label="Vía" value={nuevaSustancia.via_administracion} onChange={handleSustanciaChange} options={[{ value: "fumada", label: "Fumada" }, { value: "inyectada", label: "Inyectada" }, { value: "oral", label: "Oral" }, { value: "inhalada", label: "Inhalada" }, { value: "otra", label: "Otra" }]} />
                                    <div className="flex items-end"><Button onClick={addSustancia} className="w-full"><Plus size={16} /> Añadir</Button></div>
                                </div>
                                {formData.sustancias_consumidas.length > 0 && (
                                    <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sustancia</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frecuencia</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edad inicio</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vía</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{formData.sustancias_consumidas.map((sustancia, index) => (<tr key={index}><td className="px-6 py-4 whitespace-nowrap text-sm">{sustancia.sustancia}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{sustancia.frecuencia}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{sustancia.edad_inicio}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{sustancia.via_administracion}</td><td className="px-6 py-4 whitespace-nowrap text-sm"><button onClick={() => removeSustancia(index)} className="text-red-600 hover:text-red-900"><Minus size={16} /></button></td></tr>))}</tbody></table></div>
                                )}
                            </Card>
                            <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Detalles del Consumo (Entrevista)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                  <Input name="principal_sustancia_consumo" label="2. Principal sustancia de consumo" value={formData.entrevista_inicial?.principal_sustancia_consumo || ""} onChange={handleEntrevistaChange} />
                                    <Input name="tipo_bebida_alcoholica" label="3. Tipo de bebida alcohólica (opcional)" value={formData.entrevista_inicial?.tipo_bebida_alcoholica || ""} onChange={handleEntrevistaChange} />
                                    <Input name="frecuencia_consumo_excesivo" label="4. Frecuencia de consumo excesivo (opcional)" value={formData.entrevista_inicial?.frecuencia_consumo_excesivo || ""} onChange={handleEntrevistaChange} />
                                    <Select name="consume_solo_o_acompanado" label="5. Normalmente consume" value={formData.entrevista_inicial?.consume_solo_o_acompanado || ""} onChange={handleEntrevistaChange} options={[{value: 'solo', label: 'Solo'}, {value: 'acompanado', label: 'Acompañado'}]} />
                                    <Select name="lugar_consumo_normalmente" label="6. Lugar donde consume" value={formData.entrevista_inicial?.lugar_consumo_normalmente || ""} onChange={handleEntrevistaChange} options={[{value: 'publico', label: 'Público'}, {value: 'privado', label: 'Privado'}]} />
                                    <Input name="lugar_consumo_frecuente" label="7. Lugar más frecuente de consumo" value={formData.entrevista_inicial?.lugar_consumo_frecuente || ""} onChange={handleEntrevistaChange} />
                                    <div className="flex items-center gap-3"><label className="text-sm font-medium">8. ¿Puede detener su consumo?</label><input type="checkbox" name="puede_detener_consumo" checked={!!formData.entrevista_inicial?.puede_detener_consumo} onChange={handleEntrevistaChange} className="h-5 w-5"/></div>
                                    <TextArea name="situaciones_llevan_a_consumir" label="10. ¿Qué situaciones lo llevan a consumir?" value={formData.entrevista_inicial?.situaciones_llevan_a_consumir || ""} onChange={handleEntrevistaChange} />
                                    <Select name="problema_consumo_drogas" label="11. Nivel de problema con drogas" value={formData.entrevista_inicial?.problema_consumo_drogas || ""} onChange={handleEntrevistaChange} options={[{value: 'sin_problema', label: 'Sin problema'}, {value: 'pequeno_problema', label: 'Pequeño problema'}, {value: 'problema', label: 'Problema'}, {value: 'gran_problema', label: 'Gran problema'}]} />
                                </div>
                            </Card>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-8">
                             <div className="flex items-center gap-3 mb-6"><div className="bg-green-100 p-2 rounded-lg"><Users className="text-green-600" size={24} /></div><h2 className="text-xl font-semibold text-gray-900">Entorno Socio-Familiar y Laboral</h2></div>
                             <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Situación Socio-Familiar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                    <TextArea name="integrantes_familia" label="23. ¿Quiénes integran su familia?" value={formData.entrevista_inicial?.integrantes_familia || ""} onChange={handleEntrevistaChange} />

                                    <TextArea name="genograma_papa" label="24. Genograma - Papá (opcional)" value={formData.entrevista_inicial?.genograma_papa || ""} onChange={handleEntrevistaChange} placeholder="Descripción de la relación, ocupación, etc." />
                                    <TextArea name="genograma_mama" label="24. Genograma - Mamá (opcional)" value={formData.entrevista_inicial?.genograma_mama || ""} onChange={handleEntrevistaChange} placeholder="Descripción de la relación, ocupación, etc." />
                                    <div className="flex items-center gap-4"><label className="text-sm font-medium">25. ¿Conflicto familiar grave (últimos 12 meses)?</label><input type="checkbox" name="conflicto_familiar_grave_ultimos_12_meses" checked={!!formData.entrevista_inicial?.conflicto_familiar_grave_ultimos_12_meses} onChange={handleEntrevistaChange} className="h-5 w-5"/></div>
                                    {formData.entrevista_inicial?.conflicto_familiar_grave_ultimos_12_meses && <Input name="conflicto_familiar_grave_cual" label="¿Cuál fue el conflicto?" value={formData.entrevista_inicial?.conflicto_familiar_grave_cual || ""} onChange={handleEntrevistaChange} />}
                                    
                                    <div className="md:col-span-2 p-4 border rounded-md"><p className="text-sm font-medium text-gray-800 mb-3">26. Como es la relación familiar:</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="flex items-center gap-2"><input type="checkbox" name="relacion_familiar_saben_padres_donde_estas" checked={!!formData.entrevista_inicial?.relacion_familiar_saben_padres_donde_estas} onChange={handleEntrevistaChange} /> ¿Saben sus padres dónde está?</label><label className="flex items-center gap-2"><input type="checkbox" name="relacion_familiar_saben_padres_como_te_sientes" checked={!!formData.entrevista_inicial?.relacion_familiar_saben_padres_como_te_sientes} onChange={handleEntrevistaChange} /> ¿Saben sus padres cómo se siente?</label><label className="flex items-center gap-2"><input type="checkbox" name="relacion_familiar_discutes_frecuentemente" checked={!!formData.entrevista_inicial?.relacion_familiar_discutes_frecuentemente} onChange={handleEntrevistaChange} /> ¿Discute frecuentemente con ellos?</label><label className="flex items-center gap-2"><input type="checkbox" name="relacion_familiar_acuerdo_en_direccion" checked={!!formData.entrevista_inicial?.relacion_familiar_acuerdo_en_direccion} onChange={handleEntrevistaChange} /> ¿Están de acuerdo en cómo dirigirlo?</label></div></div>
                                      <div className="p-4 border rounded-md space-y-3"><p className="text-sm font-medium text-gray-800">27. Normas Familiares con relacion al consumo de drogas:</p><label className="flex items-center gap-2"><input type="checkbox" name="normas_familiares_saben_consumo" checked={!!formData.entrevista_inicial?.normas_familiares_saben_consumo} onChange={handleEntrevistaChange} /> ¿Sus padres saben que consume?</label><label className="flex items-center gap-2"><input type="checkbox" name="normas_familiares_reglas_claras" checked={!!formData.entrevista_inicial?.normas_familiares_reglas_claras} onChange={handleEntrevistaChange} /> ¿Le han puesto reglas claras?</label><label className="flex items-center gap-2"><input type="checkbox" name="normas_familiares_importante_cumplir_normas" checked={!!formData.entrevista_inicial?.normas_familiares_importante_cumplir_normas} onChange={handleEntrevistaChange} /> ¿Es importante para usted cumplir?</label></div>
                                       <div className="flex items-center gap-4"><label className="text-sm font-medium">28. ¿Has tenido relaciones sexuales despues de consumir drogas?</label><input type="checkbox" name="relacion_sexual_despues_de_drogas" checked={!!formData.entrevista_inicial?.relacion_sexual_despues_de_drogas} onChange={handleEntrevistaChange} className="h-5 w-5"/></div>
                                    {formData.entrevista_inicial?.relacion_sexual_despues_de_drogas}
                               
                                    <div className="flex items-center gap-4"><label className="text-sm font-medium">29. ¿Involucrado en abuso por consumo?</label><input type="checkbox" name="involucrado_abuso_fisico_sexual_por_consumo" checked={!!formData.entrevista_inicial?.involucrado_abuso_fisico_sexual_por_consumo} onChange={handleEntrevistaChange} className="h-5 w-5"/></div>
                                    {formData.entrevista_inicial?.involucrado_abuso_fisico_sexual_por_consumo && <Select name="involucrado_abuso_fisico_sexual_tipo" label="Tipo de abuso (opcional)" value={formData.entrevista_inicial?.involucrado_abuso_fisico_sexual_tipo || ""} onChange={handleEntrevistaChange} options={[{value: 'fisico', label: 'Físico'}, {value: 'sexual', label: 'Sexual'}, {value: 'ambos', label: 'Ambos'}]} />}
                                </div>
                            </Card>
                             <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Tiempo Libre y Situación Laboral</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                    <TextArea name="tiempo_dedicado_consumo_actividades_dejadas" label="30. ¿Cuánto tiempo le dedica a consumir y qué actividades ha dejado de hacer?" value={formData.entrevista_inicial?.tiempo_dedicado_consumo_actividades_dejadas || ""} onChange={handleEntrevistaChange} />
                                    <TextArea name="actividades_diversion_relacionadas_consumo" label="31. ¿Qué actividades de diversión realiza relacionadas al consumo? (opcional)" value={formData.entrevista_inicial?.actividades_diversion_relacionadas_consumo || ""} onChange={handleEntrevistaChange} />
                                    <Input type="number" name="dias_no_trabajo_por_consumo_ultimos_12_meses" label="32. Días que no trabajó por consumo (últimos 12 meses)" value={formData.entrevista_inicial?.dias_no_trabajo_por_consumo_ultimos_12_meses || ""} onChange={handleEntrevistaChange} />
                                    <Input type="number" name="veces_perdio_empleo_por_consumo_ultimos_12_meses" label="33. Veces que perdió el empleo por consumo (últimos 12 meses)" value={formData.entrevista_inicial?.veces_perdio_empleo_por_consumo_ultimos_12_meses || ""} onChange={handleEntrevistaChange} />
                                </div>
                            </Card>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-6"><div className="bg-red-100 p-2 rounded-lg"><Heart className="text-red-600" size={24} /></div><h2 className="text-xl font-semibold text-gray-900">Salud y Antecedentes Médicos</h2></div>
                            <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Evaluación Física</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input name="estado_nutricional.peso_actual" label="Peso actual (kg)" type="number" step="0.1" value={formData.estado_nutricional?.peso_actual || ""} onChange={handleChange} error={errors['estado_nutricional.peso_actual']} required />
                                    <Input name="estado_nutricional.talla" label="Talla (cm)" type="number" value={formData.estado_nutricional?.talla || ""} onChange={handleChange} error={errors['estado_nutricional.talla']} required />
                                    {formData.estado_nutricional?.imc && (<div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm font-medium text-gray-700">IMC calculado:</p><p className="text-2xl font-bold">{formData.estado_nutricional.imc} - {formData.estado_nutricional.imc < 18.5 ? " Bajo peso" : formData.estado_nutricional.imc < 25 ? " Normal" : formData.estado_nutricional.imc < 30 ? " Sobrepeso" : " Obesidad"}</p></div>)}
                                    <Select name="estado_nutricional.apetito" label="Apetito" value={formData.estado_nutricional?.apetito || "normal"} onChange={handleChange} options={[{ value: "normal", label: "Normal" }, { value: "aumentado", label: "Aumentado" }, { value: "disminuido", label: "Disminuido" }, { value: "ausente", label: "Ausente" }]} />
                                    <TextArea name="estado_nutricional.alergias_alimenticias" label="Alergias alimenticias (opcional)" value={formData.estado_nutricional?.alergias_alimenticias || ""} onChange={handleChange} rows={2} />
                                    <TextArea name="estado_nutricional.problemas_digestivos" label="Problemas digestivos (opcional)" value={formData.estado_nutricional?.problemas_digestivos || ""} onChange={handleChange} rows={2} />
                                </div>
                            </Card>
                             <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Salud Mental y Física (Entrevista)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                    <div className="p-4 border rounded-md space-y-3"><p className="text-sm font-medium text-gray-800">34-36. Ideas suicidas:</p><label className="flex items-center gap-2"><input type="checkbox" name="pensado_estar_mejor_muerto_ultimo_mes" checked={!!formData.entrevista_inicial?.pensado_estar_mejor_muerto_ultimo_mes} onChange={handleEntrevistaChange} /> 34. ¿Ha pensado que estaría mejor muerto (último mes)?</label>{formData.entrevista_inicial?.pensado_estar_mejor_muerto_ultimo_mes && <label className="flex items-center gap-2 ml-4"><input type="checkbox" name="intentado_suicidarse_ultimo_mes" checked={!!formData.entrevista_inicial?.intentado_suicidarse_ultimo_mes} onChange={handleEntrevistaChange} /> 35. ¿Ha intentado suicidarse?</label>}<label className="flex items-center gap-2"><input type="checkbox" name="intentado_suicidarse_alguna_vez" checked={!!formData.entrevista_inicial?.intentado_suicidarse_alguna_vez} onChange={handleEntrevistaChange} /> 36. ¿Alguna vez en la vida ha intentado suicidarse?</label></div>
                                    <div className="p-4 border rounded-md space-y-3"><p className="text-sm font-medium text-gray-800">37-42. Historial de salud:</p><label className="flex items-center gap-2"><input type="checkbox" name="enfermedad_o_padecimiento_fisico_mental" checked={!!formData.entrevista_inicial?.enfermedad_o_padecimiento_fisico_mental} onChange={handleEntrevistaChange} /> 37. ¿Presenta alguna enfermedad física/mental?</label>{formData.entrevista_inicial?.enfermedad_o_padecimiento_fisico_mental && <label className="flex items-center gap-2 ml-4"><input type="checkbox" name="enfermedad_derivada_consumo" checked={!!formData.entrevista_inicial?.enfermedad_derivada_consumo} onChange={handleEntrevistaChange} /> 38. ¿Fue derivada del consumo?</label>}<div className="flex items-center gap-2"><label><input type="checkbox" name="atendido_problema_salud" checked={!!formData.entrevista_inicial?.atendido_problema_salud} onChange={handleEntrevistaChange} /> 39. ¿Atendido por problema de salud?</label> {formData.entrevista_inicial?.atendido_problema_salud && <Input name="atendido_problema_salud_cual" label="¿Cuál?" value={formData.entrevista_inicial?.atendido_problema_salud_cual || ""} onChange={handleEntrevistaChange} />}</div><div className="flex items-center gap-2"><label><input type="checkbox" name="tomando_medicamento" checked={!!formData.entrevista_inicial?.tomando_medicamento} onChange={handleEntrevistaChange} /> 40. ¿Está tomando medicamento?</label> {formData.entrevista_inicial?.tomando_medicamento && <Input name="tomando_medicamento_cual" label="¿Cuál?" value={formData.entrevista_inicial?.tomando_medicamento_cual || ""} onChange={handleEntrevistaChange} />}</div><label className="flex items-center gap-2"><input type="checkbox" name="internado_hospital_ultimos_12_meses" checked={!!formData.entrevista_inicial?.internado_hospital_ultimos_12_meses} onChange={handleEntrevistaChange} /> 41. ¿Internado en hospital (12 meses)?</label>{formData.entrevista_inicial?.internado_hospital_ultimos_12_meses && <label className="flex items-center gap-2 ml-4"><input type="checkbox" name="internado_hospital_por_consumo" checked={!!formData.entrevista_inicial?.internado_hospital_por_consumo} onChange={handleEntrevistaChange} /> 42. ¿Fue por consumo de drogas?</label>}</div>
                                </div>
                            </Card>
                            <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Tratamientos Previos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                    <div className="flex items-center gap-3"><label className="text-sm font-medium">43. ¿Ha recibido tratamiento previo?</label><input type="checkbox" name="recibido_tratamiento_previo" checked={!!formData.entrevista_inicial?.recibido_tratamiento_previo} onChange={handleEntrevistaChange} className="h-5 w-5"/></div>
                                    <TextArea name="detalles_tratamiento_previo" label="44. Detalles del tratamiento previo (opcional)" value={formData.entrevista_inicial?.detalles_tratamiento_previo || ""} onChange={handleEntrevistaChange} />
                                    <Select name="satisfaccion_estilo_de_vida" label="45. ¿Qué tan satisfecho se encuentra con su estilo de vida?" value={formData.entrevista_inicial?.satisfaccion_estilo_de_vida || ""} onChange={handleEntrevistaChange} options={[{value: 'muy_satisfecho', label: 'Muy Satisfecho'}, {value: 'satisfecho', label: 'Satisfecho'}, {value: 'insatisfecho', label: 'Insatisfecho'}, {value: 'muy_insatisfecho', label: 'Muy Insatisfecho'}]} />
                                </div>
                            </Card>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-6"><div className="bg-yellow-100 p-2 rounded-lg"><Target className="text-yellow-600" size={24} /></div><h2 className="text-xl font-semibold text-gray-900">Disposición, Metas y Observaciones</h2></div>
                            
                             <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Metas y Expectativas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                   <div className="md:col-span-2 p-4 border rounded-md"><h4 className="text-md font-semibold text-gray-700 mb-4">46. Metas para el futuro (opcional)</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input name="metas_consumo_drogas" label="Consumo de drogas" value={formData.entrevista_inicial?.metas_consumo_drogas || ""} onChange={handleEntrevistaChange} /><Input name="metas_salud_fisica" label="Salud física" value={formData.entrevista_inicial?.metas_salud_fisica || ""} onChange={handleEntrevistaChange} /><Input name="metas_trabajo_escuela" label="Trabajo y escuela" value={formData.entrevista_inicial?.metas_trabajo_escuela || ""} onChange={handleEntrevistaChange} /><Input name="metas_manejo_dinero" label="Manejo del dinero" value={formData.entrevista_inicial?.metas_manejo_dinero || ""} onChange={handleEntrevistaChange} /><Input name="metas_relaciones_pareja" label="Relaciones de pareja" value={formData.entrevista_inicial?.metas_relaciones_pareja || ""} onChange={handleEntrevistaChange} /><Input name="metas_situacion_legal" label="Situación legal" value={formData.entrevista_inicial?.metas_situacion_legal || ""} onChange={handleEntrevistaChange} /><Input name="metas_vida_emocional" label="Vida Emocional" value={formData.entrevista_inicial?.metas_vida_emocional || ""} onChange={handleEntrevistaChange} /><Input name="metas_comunicacion" label="Comunicación" value={formData.entrevista_inicial?.metas_comunicacion || ""} onChange={handleEntrevistaChange} /><Input name="metas_social_recreativas" label="Social/Recreativas" value={formData.entrevista_inicial?.metas_social_recreativas || ""} onChange={handleEntrevistaChange} /><Input name="metas_general" label="General" value={formData.entrevista_inicial?.metas_general || ""} onChange={handleEntrevistaChange} /></div></div>
                                </div>
                            </Card>
                            <Card className="p-6 bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Observaciones de la Sesión</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                    <TextArea name="problemas_sesion" label="47. Problemas presentados durante la sesión (opcional)" value={formData.entrevista_inicial?.problemas_sesion || ""} onChange={handleEntrevistaChange} />
                                    <TextArea name="observaciones_generales" label="48. Observaciones generales (opcional)" value={formData.entrevista_inicial?.observaciones_generales || ""} onChange={handleEntrevistaChange} />
                                    <Input name="nombre_quien_aplico_entrevista" label="Nombre de quien aplicó la entrevista" value={formData.entrevista_inicial?.nombre_quien_aplico_entrevista || ""} onChange={handleEntrevistaChange} />
                                    <Input name="cargo_quien_aplico_entrevista" label="Cargo de quien aplicó la entrevista" value={formData.entrevista_inicial?.cargo_quien_aplico_entrevista || ""} onChange={handleEntrevistaChange} />
                                </div>
                            </Card>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6"><div className="bg-indigo-100 p-2 rounded-lg"><UserPlus className="text-indigo-600" size={24} /></div><h2 className="text-xl font-semibold text-gray-900">Información de Ingreso</h2></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input name="fecha_ingreso" label="Fecha de ingreso" type="date" value={formData.fecha_ingreso} onChange={handleChange} max={format(new Date(), 'yyyy-MM-dd')} />
                                <Input name="evaluador" label="Evaluador responsable" value={formData.evaluador} onChange={handleChange} error={errors.evaluador} required={!isEditing} />
                                <div className="flex items-center space-x-2 md:col-span-2"><input type="checkbox" id="voluntario" name="voluntario" checked={formData.voluntario} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><label htmlFor="voluntario" className="text-sm font-medium text-gray-700">¿Es ingreso voluntario?</label></div>
                                <div className="md:col-span-2"><TextArea name="motivo_ingreso" label="Motivo de ingreso (detallado)" value={formData.motivo_ingreso} onChange={handleChange} error={errors.motivo_ingreso} required={!isEditing} rows={6} /></div>
                            </div>
                            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Registro</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div><span className="font-medium text-gray-700">Nombre:</span> {formData.nombre_completo}</div>
                                    <div><span className="font-medium text-gray-700">Documento:</span> {formData.documento}</div>
                                    <div><span className="font-medium text-gray-700">Edad:</span> {formData.edad} años</div>
                                    <div><span className="font-medium text-gray-700">Expediente:</span> {formData.numero_expediente}</div>
                                    <div><span className="font-medium text-gray-700">Fecha de ingreso:</span> {formData.fecha_ingreso}</div>
                                    <div><span className="font-medium text-gray-700">Tipo de ingreso:</span> {formData.voluntario ? 'Voluntario' : 'No voluntario'}</div>
                                    <div className="md:col-span-3"><span className="font-medium text-gray-700">Sustancias consumidas:</span> {formData.sustancias_consumidas.length > 0 ? (<ul className="list-disc list-inside mt-1">{formData.sustancias_consumidas.map((s, i) => (<li key={i}>{s.sustancia} ({s.frecuencia})</li>))}</ul>) : 'Ninguna registrada'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        <div>{currentStep > 1 && (<Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2"><ArrowLeft size={18} /> Anterior</Button>)}</div>
                        <div className="flex gap-3">
                            {currentStep < steps.length ? (
                                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-6">Siguiente</Button>
                            ) : (
                                <Button onClick={handleSubmit} isLoading={loading} className="bg-green-600 hover:bg-green-700 text-white px-6 flex items-center gap-2" disabled={loading}><Save size={18} />{loading ? "Guardando..." : isEditing ? "Actualizar Paciente" : "Guardar Paciente"}</Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CrearPacientePage;
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
    User, FileText, Calendar, Phone, Mail, Home, Users, Heart,
    GraduationCap, DollarSign, ArrowLeft, Save, Plus, Minus,
    Droplet, Activity, AlertTriangle, Clipboard, Stethoscope,
    Shield, UserPlus, Pill, Utensils
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
        apoyo_familiar: "medio"
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
                            motivo_ingreso: ""
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
    }, [id, isEditing]);

    useEffect(() => {
        if (formData.fecha_nacimiento) {
            const hoy = new Date();
            const nacimiento = new Date(formData.fecha_nacimiento);
            const edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();

            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                setFormData(prev => ({ ...prev, edad: edad - 1 }));
            } else {
                setFormData(prev => ({ ...prev, edad }));
            }
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
    }, [isEditing]);

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
            if (!formData.telefono.trim()) newErrors.telefono = "Teléfono es requerido";
        }

        if (step === 2) {
            if (!formData.quien_lo_trajo?.nombre.trim()) newErrors['quien_lo_trajo.nombre'] = "Nombre es requerido";
            if (!formData.quien_lo_trajo?.parentesco.trim()) newErrors['quien_lo_trajo.parentesco'] = "Parentesco es requerido";
            if (!formData.quien_lo_trajo?.telefono.trim()) newErrors['quien_lo_trajo.telefono'] = "Teléfono es requerido";
            if (formData.sustancias_consumidas.length === 0) newErrors.sustancias = "Debe registrar al menos una sustancia";
        }

        if (step === 3) {
            if (!formData.estado_nutricional.ultima_comida) newErrors['estado_nutricional.ultima_comida'] = "Última comida es requerida";
            if (!formData.estado_nutricional.peso_actual) newErrors['estado_nutricional.peso_actual'] = "Peso es requerido";
            if (!formData.estado_nutricional.talla) newErrors['estado_nutricional.talla'] = "Talla es requerida";
        }

        if (step === 4) {
            if (!formData.motivo_consulta.trim()) newErrors.motivo_consulta = "Motivo de consulta es requerido";
            if (!formData.expectativas_tratamiento.trim()) newErrors.expectativas_tratamiento = "Expectativas son requeridas";
        }

        if (step === 5 && !isEditing) {
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
        { number: 3, title: "Evaluación Física", icon: Activity },
        { number: 4, title: "Evaluación Psicológica", icon: Clipboard },
        { number: 5, title: "Información de Ingreso", icon: UserPlus }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
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

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`
                                    flex items-center justify-center w-12 h-12 rounded-full border-2 
                                    ${currentStep >= step.number ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-300'}
                                `}>
                                    <step.icon size={20} />
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>
                                        Paso {step.number}
                                    </p>
                                    <p className={`text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.title}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 ml-6 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <Card className="p-8">
                    {/* Paso 1: Datos Personales */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <User className="text-blue-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Datos Personales</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input
                                        name="nombre_completo"
                                        label="Nombre completo"
                                        value={formData.nombre_completo}
                                        onChange={handleChange}
                                        error={errors.nombre_completo}
                                        required
                                    />
                                </div>

                                <Input
                                    name="documento"
                                    label="Número de documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    error={errors.documento}
                                    required
                                />

                                <Input
                                    name="fecha_nacimiento"
                                    label="Fecha de nacimiento"
                                    type="date"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    error={errors.fecha_nacimiento}
                                    required
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                />

                                <Input
                                    name="telefono"
                                    label="Teléfono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    error={errors.telefono}
                                    required
                                />

                                <Input
                                    name="email"
                                    label="Correo electrónico (opcional)"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                                <Input
                                    name="direccion"
                                    label="Dirección completa (opcional)"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                />

                                <Select
                                    name="sexo"
                                    label="Sexo"
                                    value={formData.sexo}
                                    onChange={handleChange}
                                    options={[
                                        { value: "masculino", label: "Masculino" },
                                        { value: "femenino", label: "Femenino" },
                                        { value: "otro", label: "Otro" },
                                        { value: "no_especifica", label: "Prefiero no especificar" }
                                    ]}
                                />

                                <Select
                                    name="estado_civil"
                                    label="Estado civil"
                                    value={formData.estado_civil}
                                    onChange={handleChange}
                                    options={[
                                        { value: "soltero", label: "Soltero/a" },
                                        { value: "casado", label: "Casado/a" },
                                        { value: "divorciado", label: "Divorciado/a" },
                                        { value: "viudo", label: "Viudo/a" },
                                        { value: "union_libre", label: "Unión libre" }
                                    ]}
                                />

                                <Input
                                    name="escolaridad"
                                    label="Escolaridad (opcional)"
                                    value={formData.escolaridad}
                                    onChange={handleChange}
                                />

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="tiene_pareja"
                                        name="tiene_pareja"
                                        checked={formData.tiene_pareja}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="tiene_pareja" className="text-sm font-medium text-gray-700">
                                        ¿Tiene pareja actualmente?
                                    </label>
                                </div>

                                {formData.tiene_pareja && (
                                    <Input
                                        name="tiempo_relacion"
                                        label="Tiempo de relación (opcional)"
                                        value={formData.tiempo_relacion}
                                        onChange={handleChange}
                                    />
                                )}

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="desempleado"
                                        name="desempleado"
                                        checked={formData.desempleado}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="desempleado" className="text-sm font-medium text-gray-700">
                                        ¿Se encuentra desempleado actualmente?
                                    </label>
                                </div>

                                {formData.desempleado && (
                                    <Input
                                        name="tiempo_desempleo"
                                        label="Tiempo de desempleo (opcional)"
                                        value={formData.tiempo_desempleo}
                                        onChange={handleChange}
                                    />
                                )}

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="depende_economicamente"
                                        name="depende_economicamente"
                                        checked={formData.depende_economicamente}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="depende_economicamente" className="text-sm font-medium text-gray-700">
                                        ¿Depende económicamente de alguien?
                                    </label>
                                </div>

                                {formData.depende_economicamente && (
                                    <Input
                                        name="de_quien_depende"
                                        label="De quién depende (opcional)"
                                        value={formData.de_quien_depende}
                                        onChange={handleChange}
                                    />
                                )}

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="alguien_depende_de_usted"
                                        name="alguien_depende_de_usted"
                                        checked={formData.alguien_depende_de_usted}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="alguien_depende_de_usted" className="text-sm font-medium text-gray-700">
                                        ¿Alguien depende económicamente de usted?
                                    </label>
                                </div>

                                {formData.alguien_depende_de_usted && (
                                    <Input
                                        name="quien_depende"
                                        label="Quién depende de usted (opcional)"
                                        value={formData.quien_depende}
                                        onChange={handleChange}
                                    />
                                )}

                                <div className="md:col-span-2">
                                    <TextArea
                                        name="personas_con_vive"
                                        label="Personas con las que vive (opcional)"
                                        value={formData.personas_con_vive}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Historial de Consumo */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Droplet className="text-purple-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Historial de Consumo</h2>
                            </div>

                            {/* Información de quién lo trajo */}
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

                            {/* Sustancias consumidas */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Pill size={20} /> Sustancias consumidas
                                </h3>
                                {errors.sustancias && (
                                    <p className="text-red-500 text-sm mb-4">{errors.sustancias}</p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <Input
                                            name="sustancia"
                                            label="Sustancia"
                                            value={nuevaSustancia.sustancia}
                                            onChange={handleSustanciaChange}
                                        />
                                    </div>
                                    <Select
                                        name="frecuencia"
                                        label="Frecuencia"
                                        value={nuevaSustancia.frecuencia}
                                        onChange={handleSustanciaChange}
                                        options={[
                                            { value: "diario", label: "Diario" },
                                            { value: "semanal", label: "Semanal" },
                                            { value: "ocasional", label: "Ocasional" },
                                            { value: "ex-consumidor", label: "Ex-consumidor" }
                                        ]}
                                    />
                                    <Input
                                        name="edad_inicio"
                                        label="Edad inicio"
                                        type="number"
                                        value={nuevaSustancia.edad_inicio}
                                        onChange={handleSustanciaChange}
                                    />
                                    <Select
                                        name="via_administracion"
                                        label="Vía administración"
                                        value={nuevaSustancia.via_administracion}
                                        onChange={handleSustanciaChange}
                                        options={[
                                            { value: "fumada", label: "Fumada" },
                                            { value: "inyectada", label: "Inyectada" },
                                            { value: "oral", label: "Oral" },
                                            { value: "inhalada", label: "Inhalada" },
                                            { value: "otra", label: "Otra" }
                                        ]}
                                    />
                                    <div className="flex items-end">
                                        <Button onClick={addSustancia} className="w-full">
                                            <Plus size={16} /> Añadir
                                        </Button>
                                    </div>
                                </div>

                                {formData.sustancias_consumidas.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sustancia</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frecuencia</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad inicio</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vía</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {formData.sustancias_consumidas.map((sustancia, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sustancia.sustancia}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sustancia.frecuencia}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sustancia.edad_inicio}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sustancia.via_administracion}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <button
                                                                onClick={() => removeSustancia(index)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Evaluación Física */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Activity className="text-green-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Evaluación Física</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <Utensils size={20} /> Estado Nutricional
                                    </h3>
                                </div>

                                <Input
                                    name="estado_nutricional.ultima_comida"
                                    label="Última comida"
                                    type="datetime-local"
                                    value={formData.estado_nutricional?.ultima_comida || ""}
                                    onChange={handleChange}
                                    error={errors['estado_nutricional.ultima_comida']}
                                    required
                                />

                                <Select
                                    name="estado_nutricional.apetito"
                                    label="Apetito"
                                    value={formData.estado_nutricional?.apetito || "normal"}
                                    onChange={handleChange}
                                    options={[
                                        { value: "normal", label: "Normal" },
                                        { value: "aumentado", label: "Aumentado" },
                                        { value: "disminuido", label: "Disminuido" },
                                        { value: "ausente", label: "Ausente" }
                                    ]}
                                />

                                <Input
                                    name="estado_nutricional.peso_actual"
                                    label="Peso actual (kg)"
                                    type="number"
                                    step="0.1"
                                    value={formData.estado_nutricional?.peso_actual || ""}
                                    onChange={handleChange}
                                    error={errors['estado_nutricional.peso_actual']}
                                    required
                                />

                                <Input
                                    name="estado_nutricional.talla"
                                    label="Talla (cm)"
                                    type="number"
                                    value={formData.estado_nutricional?.talla || ""}
                                    onChange={handleChange}
                                    error={errors['estado_nutricional.talla']}
                                    required
                                />

                                {formData.estado_nutricional?.imc && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700">IMC calculado:</p>
                                        <p className="text-2xl font-bold">
                                            {formData.estado_nutricional.imc} - 
                                            {formData.estado_nutricional.imc < 18.5 ? " Bajo peso" : 
                                             formData.estado_nutricional.imc < 25 ? " Normal" : 
                                             formData.estado_nutricional.imc < 30 ? " Sobrepeso" : " Obesidad"}
                                        </p>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <TextArea
                                        name="estado_nutricional.alergias_alimenticias"
                                        label="Alergias alimenticias (opcional)"
                                        value={formData.estado_nutricional?.alergias_alimenticias || ""}
                                        onChange={handleChange}
                                        rows={2}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <TextArea
                                        name="estado_nutricional.problemas_digestivos"
                                        label="Problemas digestivos (opcional)"
                                        value={formData.estado_nutricional?.problemas_digestivos || ""}
                                        onChange={handleChange}
                                        rows={2}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="tiene_historial_medico"
                                            checked={showHistorialMedico}
                                            onChange={(e) => {
                                                setShowHistorialMedico(e.target.checked);
                                                if (!e.target.checked) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        historial_medico: {
                                                            enfermedades_previas: "",
                                                            medicamentos_actuales: "",
                                                            alergias_medicamentos: "",
                                                            hospitalizaciones_previas: "",
                                                            cirugias_previas: ""
                                                        }
                                                    }));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="tiene_historial_medico" className="text-sm font-medium text-gray-700">
                                            ¿Tiene historial médico relevante?
                                        </label>
                                    </div>

                                    {showHistorialMedico && (
                                        <>
                                            <TextArea
                                                name="historial_medico.enfermedades_previas"
                                                label="Enfermedades previas (opcional)"
                                                value={formData.historial_medico?.enfermedades_previas || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />

                                            <TextArea
                                                name="historial_medico.medicamentos_actuales"
                                                label="Medicamentos actuales (opcional)"
                                                value={formData.historial_medico?.medicamentos_actuales || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />

                                            <TextArea
                                                name="historial_medico.alergias_medicamentos"
                                                label="Alergias a medicamentos (opcional)"
                                                value={formData.historial_medico?.alergias_medicamentos || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />

                                            <TextArea
                                                name="historial_medico.hospitalizaciones_previas"
                                                label="Hospitalizaciones previas (opcional)"
                                                value={formData.historial_medico?.hospitalizaciones_previas || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />

                                            <TextArea
                                                name="historial_medico.cirugias_previas"
                                                label="Cirugías previas (opcional)"
                                                value={formData.historial_medico?.cirugias_previas || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 4: Evaluación Psicológica */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                    <Clipboard className="text-yellow-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Evaluación Psicológica</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="tiene_intentos_suicidas"
                                        checked={(formData.estado_psicologico?.intentos_suicidas || 0) > 0}
                                        onChange={(e) => {
                                            if (!e.target.checked) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    estado_psicologico: {
                                                        ...prev.estado_psicologico,
                                                        intentos_suicidas: 0
                                                    }
                                                }));
                                            }
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="tiene_intentos_suicidas" className="text-sm font-medium text-gray-700">
                                        ¿Ha tenido intentos suicidas?
                                    </label>
                                </div>

                                {(formData.estado_psicologico?.intentos_suicidas || 0) > 0 ? (
                                    <Input
                                        name="estado_psicologico.intentos_suicidas"
                                        label="Número de intentos suicidas (opcional)"
                                        type="number"
                                        value={formData.estado_psicologico?.intentos_suicidas || 0}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                ) : null}

                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="tiene_historial_psiquiatrico"
                                            checked={showHistorialPsiquiatrico}
                                            onChange={(e) => {
                                                setShowHistorialPsiquiatrico(e.target.checked);
                                                if (!e.target.checked) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        estado_psicologico: {
                                                            ...prev.estado_psicologico,
                                                            tratamientos_psiquiatricos_previos: "",
                                                            diagnostico_psiquiatrico: "",
                                                            medicacion_psiquiatrica: ""
                                                        }
                                                    }));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="tiene_historial_psiquiatrico" className="text-sm font-medium text-gray-700">
                                            ¿Tiene historial psiquiátrico?
                                        </label>
                                    </div>

                                    {showHistorialPsiquiatrico && (
                                        <>
                                            <TextArea
                                                name="estado_psicologico.tratamientos_psiquiatricos_previos"
                                                label="Tratamientos psiquiátricos previos (opcional)"
                                                value={formData.estado_psicologico?.tratamientos_psiquiatricos_previos || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />

                                            <TextArea
                                                name="estado_psicologico.diagnostico_psiquiatrico"
                                                label="Diagnóstico psiquiátrico (opcional)"
                                                value={formData.estado_psicologico?.diagnostico_psiquiatrico || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />

                                            <TextArea
                                                name="estado_psicologico.medicacion_psiquiatrica"
                                                label="Medicación psiquiátrica actual (opcional)"
                                                value={formData.estado_psicologico?.medicacion_psiquiatrica || ""}
                                                onChange={handleChange}
                                                rows={2}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <Shield size={20} /> Motivos y Expectativas
                                    </h3>
                                </div>

                                <div className="md:col-span-2">
                                    <TextArea
                                        name="motivo_consulta"
                                        label="Motivo principal de consulta"
                                        value={formData.motivo_consulta}
                                        onChange={handleChange}
                                        error={errors.motivo_consulta}
                                        required
                                        rows={4}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <TextArea
                                        name="expectativas_tratamiento"
                                        label="Expectativas del tratamiento"
                                        value={formData.expectativas_tratamiento}
                                        onChange={handleChange}
                                        error={errors.expectativas_tratamiento}
                                        required
                                        rows={4}
                                    />
                                </div>

                                <Select
                                    name="apoyo_familiar"
                                    label="Nivel de apoyo familiar"
                                    value={formData.apoyo_familiar}
                                    onChange={handleChange}
                                    options={[
                                        { value: "alto", label: "Alto" },
                                        { value: "medio", label: "Medio" },
                                        { value: "bajo", label: "Bajo" },
                                        { value: "ninguno", label: "Ninguno" }
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 5: Información de Ingreso */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <UserPlus className="text-indigo-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Información de Ingreso</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    name="fecha_ingreso"
                                    label="Fecha de ingreso"
                                    type="date"
                                    value={formData.fecha_ingreso}
                                    onChange={handleChange}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                />

                                <Input
                                    name="evaluador"
                                    label="Evaluador responsable"
                                    value={formData.evaluador}
                                    onChange={handleChange}
                                    error={errors.evaluador}
                                    required={!isEditing}
                                />

                                <div className="flex items-center space-x-2 md:col-span-2">
                                    <input
                                        type="checkbox"
                                        id="voluntario"
                                        name="voluntario"
                                        checked={formData.voluntario}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="voluntario" className="text-sm font-medium text-gray-700">
                                        ¿Es ingreso voluntario?
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <TextArea
                                        name="motivo_ingreso"
                                        label="Motivo de ingreso (detallado)"
                                        value={formData.motivo_ingreso}
                                        onChange={handleChange}
                                        error={errors.motivo_ingreso}
                                        required={!isEditing}
                                        rows={6}
                                    />
                                </div>
                            </div>

                            {/* Resumen */}
                            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Registro</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Nombre:</span> {formData.nombre_completo}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Documento:</span> {formData.documento}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Edad:</span> {formData.edad} años
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Expediente:</span> {formData.numero_expediente}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Fecha de ingreso:</span> {formData.fecha_ingreso}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Tipo de ingreso:</span> {formData.voluntario ? 'Voluntario' : 'No voluntario'}
                                    </div>
                                    <div className="md:col-span-3">
                                        <span className="font-medium text-gray-700">Sustancias consumidas:</span> 
                                        {formData.sustancias_consumidas.length > 0 ? (
                                            <ul className="list-disc list-inside mt-1">
                                                {formData.sustancias_consumidas.map((s, i) => (
                                                    <li key={i}>{s.sustancia} ({s.frecuencia})</li>
                                                ))}
                                            </ul>
                                        ) : 'Ninguna registrada'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        <div>
                            {currentStep > 1 && (
                                <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
                                    <ArrowLeft size={18} /> Anterior
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {currentStep < steps.length ? (
                                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                                    Siguiente
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <Save size={18} />
                                    {loading ? "Guardando..." : isEditing ? "Actualizar Paciente" : "Guardar Paciente"}
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CrearPacientePage;
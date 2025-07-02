// features/pacientes/pages/CrearPacientePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/TextArea';
import { usePacientes } from '../hooks/usePacientes';
import { CrearPacienteData } from '../types/paciente';
import {
    User,
    FileText,
    Calendar,
    Phone,
    Mail,
    Home,
    Users,
    Heart,
    GraduationCap,
    DollarSign,
    ArrowLeft,
    Save
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
        // Datos básicos
        nombre_completo: "",
        documento: "",
        fecha_nacimiento: "",
        direccion: "",
        telefono: "",
        email: "",
        voluntario: false,

        // Entrevista inicial
        fecha_entrevista: format(new Date(), 'yyyy-MM-dd'),
        numero_expediente: "",
        edad: 0,
        sexo: "masculino" as const,
        estado_civil: "soltero" as const,
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

        // Datos de ingreso (van a la subcolección)
        fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
        motivo_ingreso: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar datos del paciente si estamos editando
    // features/pacientes/pages/CrearPacientePage.tsx
    // En el useEffect de carga de datos:

    // features/pacientes/pages/CrearPacientePage.tsx
    // CAMBIA este useEffect:

    useEffect(() => {
        const loadPacienteData = async () => {
            if (isEditing && id) {
                console.log("🔄 Iniciando carga de paciente con ID:", id);
                setLoadingData(true);

                try {
                    const paciente = await getPaciente(id);
                    console.log("📥 Paciente obtenido:", paciente);

                    if (paciente) {
                        setFormData({
                            nombre_completo: paciente.nombre_completo || "",
                            documento: paciente.documento || "",
                            fecha_nacimiento: paciente.fecha_nacimiento || "",
                            direccion: paciente.direccion || "",
                            telefono: paciente.telefono || "",
                            email: paciente.email || "",
                            voluntario: paciente.voluntario || false,
                            fecha_entrevista: paciente.fecha_entrevista || format(new Date(), 'yyyy-MM-dd'),
                            numero_expediente: paciente.numero_expediente || "",
                            edad: paciente.edad || 0,
                            sexo: paciente.sexo || "masculino",
                            estado_civil: paciente.estado_civil || "soltero",
                            escolaridad: paciente.escolaridad || "",
                            desempleado: paciente.desempleado || false,
                            tiempo_desempleo: paciente.tiempo_desempleo || "",
                            depende_economicamente: paciente.depende_economicamente || false,
                            de_quien_depende: paciente.de_quien_depende || "",
                            alguien_depende_de_usted: paciente.alguien_depende_de_usted || false,
                            quien_depende: paciente.quien_depende || "",
                            personas_con_vive: paciente.personas_con_vive || "",
                            tiene_pareja: paciente.tiene_pareja || false,
                            tiempo_relacion: paciente.tiempo_relacion || "",
                            // Para edición, no modificamos los datos de ingreso
                            fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
                            motivo_ingreso: "",
                        });
                        console.log("✅ Datos cargados correctamente");
                    } else {
                        console.log("❌ Paciente no encontrado, redirigiendo");
                        navigate('/pacientes');
                    }
                } catch (error) {
                    console.error("🚨 Error al cargar paciente:", error);
                    navigate('/pacientes');
                } finally {
                    setLoadingData(false);
                }
            }
        };

        loadPacienteData();
    }, [id, isEditing]); // ❌ QUITA getPaciente y navigate de las dependencias

    // Calcular edad automáticamente
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

    // Generar número de expediente automáticamente solo si es nuevo
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.nombre_completo.trim()) newErrors.nombre_completo = "Nombre completo es requerido";
            if (!formData.documento.trim()) newErrors.documento = "Documento es requerido";
            if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Fecha de nacimiento es requerida";
            if (!formData.telefono.trim()) newErrors.telefono = "Teléfono es requerido";
            if (!formData.direccion.trim()) newErrors.direccion = "Dirección es requerida";
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Correo electrónico no válido";
            }
        }

        if (step === 2) {
            if (!formData.fecha_entrevista) newErrors.fecha_entrevista = "Fecha de entrevista es requerida";
            if (!formData.numero_expediente.trim()) newErrors.numero_expediente = "Número de expediente es requerido";
            if (!formData.escolaridad.trim()) newErrors.escolaridad = "Escolaridad es requerida";
            if (!formData.personas_con_vive.trim()) newErrors.personas_con_vive = "Información sobre con quién vive es requerida";

            if (formData.desempleado && !formData.tiempo_desempleo?.trim()) {
                newErrors.tiempo_desempleo = "Tiempo de desempleo es requerido";
            }

            if (formData.depende_economicamente && !formData.de_quien_depende?.trim()) {
                newErrors.de_quien_depende = "Especifique de quién depende económicamente";
            }

            if (formData.alguien_depende_de_usted && !formData.quien_depende?.trim()) {
                newErrors.quien_depende = "Especifique quién depende económicamente de usted";
            }

            if (formData.tiene_pareja && !formData.tiempo_relacion?.trim()) {
                newErrors.tiempo_relacion = "Tiempo de relación es requerido";
            }
        }

        // Para edición, el paso 3 no es obligatorio ya que no modificamos ingresos
        if (step === 3 && !isEditing) {
            if (!formData.motivo_ingreso.trim()) newErrors.motivo_ingreso = "Motivo de ingreso es requerido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            // Si estamos editando, saltamos el paso 3
            if (isEditing && currentStep === 2) {
                handleSubmit();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        const stepToValidate = isEditing ? 2 : 3;
        if (!validateStep(stepToValidate)) return;

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

    const steps = isEditing
        ? [
            { number: 1, title: "Información Personal", icon: User },
            { number: 2, title: "Entrevista Inicial", icon: FileText }
        ]
        : [
            { number: 1, title: "Información Personal", icon: User },
            { number: 2, title: "Entrevista Inicial", icon: FileText },
            { number: 3, title: "Información de Ingreso", icon: Calendar }
        ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/pacientes')}
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Volver a Pacientes
                    </Button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditing ? "Editar Paciente" : "Registrar Nuevo Paciente"}
                    </h1>
                    <p className="text-gray-600">
                        {isEditing
                            ? "Actualice la información del paciente"
                            : "Complete la información del paciente y la entrevista inicial"
                        }
                    </p>
                </div>

                {/* Progress Steps */}

                <div className="mb-8">
                    {isEditing ? (
                        // Layout especial para edición (2 pasos)
                        <div className="flex items-center justify-center max-w-2xl mx-auto">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`
              flex items-center justify-center w-12 h-12 rounded-full border-2 
              ${currentStep >= step.number
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-400 border-gray-300'
                                            }
            `}>
                                            <step.icon size={20} />
                                        </div>

                                        <div className="mt-2 text-center">
                                            <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                                                }`}>
                                                Paso {step.number}
                                            </p>
                                            <p className={`text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {step.title}
                                            </p>
                                        </div>
                                    </div>

                                    {index < steps.length - 1 && (
                                        <div className={`
              w-24 h-0.5 mx-8 
              ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'}
            `} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (

                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`
            flex items-center justify-center w-12 h-12 rounded-full border-2 
            ${currentStep >= step.number
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-400 border-gray-300'
                                        }
          `}>
                                        <step.icon size={20} />
                                    </div>

                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                                            }`}>
                                            Paso {step.number}
                                        </p>
                                        <p className={`text-sm ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                            {step.title}
                                        </p>
                                    </div>

                                    {index < steps.length - 1 && (
                                        <div className={`
              w-16 h-0.5 ml-6 
              ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'}
            `} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Content */}
                <Card className="p-8">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <User className="text-blue-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Información Personal
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input
                                        name="nombre_completo"
                                        label="Nombre completo"
                                        placeholder="Ej: Andrea Gómez Martínez"
                                        value={formData.nombre_completo}
                                        onChange={handleChange}
                                        leftIcon={<User size={18} className="text-gray-400" />}
                                        error={errors.nombre_completo}
                                        required
                                    />
                                </div>

                                <Input
                                    name="documento"
                                    label="Número de documento"
                                    placeholder="1032456789"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    leftIcon={<FileText size={18} className="text-gray-400" />}
                                    error={errors.documento}
                                    required
                                />

                                <Input
                                    name="telefono"
                                    label="Teléfono"
                                    placeholder="3001234567"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    leftIcon={<Phone size={18} className="text-gray-400" />}
                                    error={errors.telefono}
                                    required
                                />

                                <Input
                                    name="fecha_nacimiento"
                                    label="Fecha de nacimiento"
                                    type="date"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    leftIcon={<Calendar size={18} className="text-gray-400" />}
                                    error={errors.fecha_nacimiento}
                                    required
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                />

                                <Input
                                    name="email"
                                    label="Correo electrónico"
                                    type="email"
                                    placeholder="paciente@correo.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    leftIcon={<Mail size={18} className="text-gray-400" />}
                                    error={errors.email}
                                />

                                <div className="md:col-span-2">
                                    <Input
                                        name="direccion"
                                        label="Dirección completa"
                                        placeholder="Ej: Cra 45 #76-30, Barrio Centro"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        leftIcon={<Home size={18} className="text-gray-400" />}
                                        error={errors.direccion}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <FileText className="text-green-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Entrevista Inicial
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    name="fecha_entrevista"
                                    label="Fecha de entrevista"
                                    type="date"
                                    value={formData.fecha_entrevista}
                                    onChange={handleChange}
                                    leftIcon={<Calendar size={18} className="text-gray-400" />}
                                    error={errors.fecha_entrevista}
                                    required
                                />

                                <Input
                                    name="numero_expediente"
                                    label="Número de expediente"
                                    value={formData.numero_expediente}
                                    onChange={handleChange}
                                    leftIcon={<FileText size={18} className="text-gray-400" />}
                                    error={errors.numero_expediente}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sexo <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="sexo"
                                        value={formData.sexo}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>

                                <Input
                                    name="edad"
                                    label="Edad"
                                    type="number"
                                    value={formData.edad.toString()}
                                    onChange={handleChange}
                                    disabled
                                    className="bg-gray-50"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado civil <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="estado_civil"
                                        value={formData.estado_civil}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="soltero">Soltero/a</option>
                                        <option value="casado">Casado/a</option>
                                        <option value="divorciado">Divorciado/a</option>
                                        <option value="viudo">Viudo/a</option>
                                        <option value="union_libre">Unión libre</option>
                                    </select>
                                </div>

                                <Input
                                    name="escolaridad"
                                    label="Escolaridad"
                                    placeholder="Ej: Bachillerato completo, Universidad incompleta"
                                    value={formData.escolaridad}
                                    onChange={handleChange}
                                    leftIcon={<GraduationCap size={18} className="text-gray-400" />}
                                    error={errors.escolaridad}
                                    required
                                />

                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-2 mb-4">
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
                                            label="¿Cuánto tiempo lleva desempleado?"
                                            placeholder="Ej: 6 meses, 1 año"
                                            value={formData.tiempo_desempleo}
                                            onChange={handleChange}
                                            error={errors.tiempo_desempleo}
                                            required
                                        />
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-2 mb-4">
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
                                            label="¿De quién depende económicamente?"
                                            placeholder="Ej: Padres, cónyuge, hermanos"
                                            value={formData.de_quien_depende}
                                            onChange={handleChange}
                                            leftIcon={<DollarSign size={18} className="text-gray-400" />}
                                            error={errors.de_quien_depende}
                                            required
                                        />
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-2 mb-4">
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
                                            label="¿Quién depende económicamente de usted?"
                                            placeholder="Ej: Hijos, padres, otros familiares"
                                            value={formData.quien_depende}
                                            onChange={handleChange}
                                            leftIcon={<Users size={18} className="text-gray-400" />}
                                            error={errors.quien_depende}
                                            required
                                        />
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <TextArea
                                        name="personas_con_vive"
                                        label="Personas con las que vive"
                                        placeholder="Describa con quién vive actualmente (familiares, amigos, solo, etc.)"
                                        value={formData.personas_con_vive}
                                        onChange={handleChange}
                                        error={errors.personas_con_vive}
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-2 mb-4">
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
                                            label="Tiempo de relación"
                                            placeholder="Ej: 2 años, 6 meses"
                                            value={formData.tiempo_relacion}
                                            onChange={handleChange}
                                            leftIcon={<Heart size={18} className="text-gray-400" />}
                                            error={errors.tiempo_relacion}
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Solo mostrar el paso 3 si NO estamos editando */}
                    {currentStep === 3 && !isEditing && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Calendar className="text-purple-600" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Información de Ingreso
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    name="fecha_ingreso"
                                    label="Fecha de ingreso"
                                    type="date"
                                    value={formData.fecha_ingreso}
                                    onChange={handleChange}
                                    leftIcon={<Calendar size={18} className="text-gray-400" />}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                />

                                <div className="flex items-center space-x-2">
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
                                        label="Motivo de ingreso"
                                        placeholder="Describa detalladamente el motivo del ingreso al centro de rehabilitación"
                                        value={formData.motivo_ingreso}
                                        onChange={handleChange}
                                        error={errors.motivo_ingreso}
                                        required
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Resumen */}
                            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Resumen del Registro
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        <div>
                            {currentStep > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft size={18} />
                                    Anterior
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {(currentStep < 3 && !isEditing) || (currentStep < 2 && isEditing) ? (
                                <Button
                                    onClick={handleNext}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                >
                                    {isEditing && currentStep === 2 ? "Actualizar" : "Siguiente"}
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
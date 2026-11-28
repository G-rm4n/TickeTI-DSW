import { CambiarPassForm } from "./CambioPassForm";

export const AjustesSection = () => {

    return (
        <div  className="sm:bg-white sm:dark:bg-slate-800 sm:border sm:border-slate-200 sm:dark:border-slate-700 sm:rounded-xl sm:p-4 sm:my-4">
            <div className="p-2 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-1 dark:text-slate-100 mb-1">
                    Ajustes
                </h1>

                <p className="text-sm text-slate-500 mb-6 dark:text-slate-400 mb-6">
                Modifica tu contraseña.
                </p>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm mt-4">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 dark:text-slate-200 mb-3">
                        Cambiar contraseña
                    </h2>
                    
                    <CambiarPassForm />
                </div>
            </div>
        </div>
    );
};
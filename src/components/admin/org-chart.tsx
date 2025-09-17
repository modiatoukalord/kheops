
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, MoreHorizontal, UserPlus, Edit, Trash2 } from "lucide-react";
import { Employee, EmployeeDepartment, departmentColors } from "./human-resources-management";
import { format, parseISO, isValid } from "date-fns";

interface OrgChartProps {
    employees: Employee[];
    onAddEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
    onUpdateEmployee: (id: string, employeeData: Partial<Omit<Employee, 'id'>>) => Promise<void>;
    onDeleteEmployee: (id: string) => Promise<void>;
}

const MemberCard = ({ member, onEdit, onDelete }: { member: Employee, onEdit: () => void, onDelete: () => void }) => (
    <Card className="text-center p-4 bg-card/60 shadow-md relative group w-56">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Avatar className="mx-auto h-16 w-16 mb-2 border-2 border-primary">
            <AvatarFallback className="bg-primary/20 text-primary">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-bold text-sm">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.role}</p>
    </Card>
);

const MemberNode = ({ member, allEmployees, onEdit, onDelete, level = 0 }: { member: Employee, allEmployees: Employee[], onEdit: (employee: Employee) => void, onDelete: (employee: Employee) => void, level?: number }) => {
    const subordinates = allEmployees.filter(e => e.reportsTo === member.id);
    const hasSubordinates = subordinates.length > 0;

    return (
        <div className="relative flex flex-col items-center">
            {/* Card for the current member */}
            <MemberCard member={member} onEdit={() => onEdit(member)} onDelete={() => onDelete(member)} />

            {/* Connecting lines to subordinates */}
            {hasSubordinates && (
                <>
                    {/* Vertical line pointing down from the card */}
                    <div className="absolute top-full left-1/2 w-px h-8 bg-border -translate-x-1/2" />
                    {/* Horizontal line */}
                    {subordinates.length > 1 && (
                        <div className="absolute top-[calc(100%_+_2rem)] left-0 w-full h-px bg-border" />
                    )}
                </>
            )}
            
            {/* Render subordinates */}
            {hasSubordinates && (
                 <div className="mt-16 flex justify-center gap-8">
                    {subordinates.map(sub => (
                        <div key={sub.id} className="relative flex flex-col items-center">
                            {/* Vertical line pointing up to the horizontal line */}
                            <div className="absolute bottom-full left-1/2 w-px h-8 bg-border -translate-x-1/2" />
                            <MemberNode member={sub} allEmployees={allEmployees} onEdit={onEdit} onDelete={onDelete} level={level + 1} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function OrgChart({ employees = [], onAddEmployee, onUpdateEmployee, onDeleteEmployee }: OrgChartProps) {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const { toast } = useToast();

    const handleOpenDialog = (employee: Employee | null) => {
        setEditingEmployee(employee);
        setDialogOpen(true);
    };

    const handleDelete = async (employee: Employee) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${employee.name} ? Cette action est irréversible.`)) {
            try {
                await onDeleteEmployee(employee.id);
                 toast({
                    title: "Employé Supprimé",
                    description: `${employee.name} a été supprimé de la base de données.`,
                    variant: "destructive"
                });
            } catch (error) {
                 console.error("Error deleting employee: ", error);
                 toast({ title: "Erreur", description: "Impossible de supprimer l'employé.", variant: "destructive" });
            }
        }
    };
    
     const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        const startDateValue = formData.get("startDate") as string;
        const startDate = isValid(parseISO(startDateValue)) ? parseISO(startDateValue) : new Date();

        const employeeData = {
            name: formData.get("name") as string,
            role: formData.get("role") as string,
            department: formData.get("department") as EmployeeDepartment,
            status: (editingEmployee?.status || 'Actif'),
            startDate: startDate,
            salary: Number(formData.get("salary")),
            phone: formData.get("phone") as string,
            email: formData.get("email") as string,
            reportsTo: formData.get("reportsTo") as string,
        };

        try {
            if (editingEmployee) {
                await onUpdateEmployee(editingEmployee.id, employeeData);
                toast({
                    title: "Employé Modifié",
                    description: `Les informations de ${employeeData.name} ont été mises à jour.`,
                });
            } else {
                await onAddEmployee(employeeData as Omit<Employee, 'id'>);
                toast({
                    title: "Employé Ajouté",
                    description: `${employeeData.name} a été ajouté à l'équipe.`,
                });
            }
            setDialogOpen(false);
            setEditingEmployee(null);
        } catch (error) {
            console.error("Error saving employee: ", error);
            toast({ title: "Erreur", description: "Impossible de sauvegarder l'employé.", variant: "destructive" });
        }
    };

    const rootEmployees = employees.filter(e => !e.reportsTo);
    const possibleManagers = employees.filter(e => e.id !== editingEmployee?.id);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Organigramme de KHEOPS</CardTitle>
                        <CardDescription>Structure organisationnelle et hiérarchique de l'entreprise.</CardDescription>
                    </div>
                     <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setEditingEmployee(null); setDialogOpen(isOpen); }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog(null)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Ajouter un employé
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <form onSubmit={handleFormSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingEmployee ? "Modifier l'employé" : "Ajouter un nouvel employé"}</DialogTitle>
                                </DialogHeader>
                                 <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nom Complet</Label>
                                                <Input id="name" name="name" defaultValue={editingEmployee?.name} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role">Rôle / Poste</Label>
                                                <Input id="role" name="role" defaultValue={editingEmployee?.role} required />
                                            </div>
                                        </div>
                                         <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="department">Département</Label>
                                                <Select name="department" defaultValue={editingEmployee?.department} required>
                                                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {Object.keys(departmentColors).map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="salary">Salaire Mensuel (FCFA)</Label>
                                                <Input id="salary" name="salary" type="number" defaultValue={editingEmployee?.salary} required />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Téléphone</Label>
                                                <Input id="phone" name="phone" type="tel" defaultValue={editingEmployee?.phone} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" name="email" type="email" defaultValue={editingEmployee?.email} required />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="startDate">Date d'embauche</Label>
                                                <Input id="startDate" name="startDate" type="date" defaultValue={editingEmployee ? format(editingEmployee.startDate, 'yyyy-MM-dd') : ''} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reportsTo">Rend compte à (Manager)</Label>
                                            <Select name="reportsTo" defaultValue={editingEmployee?.reportsTo}>
                                                <SelectTrigger><SelectValue placeholder="Aucun manager direct" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Aucun</SelectItem>
                                                    {possibleManagers.map(manager => (
                                                        <SelectItem key={manager.id} value={manager.id}>{manager.name} ({manager.role})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                <DialogFooter className="pt-4 border-t">
                                    <Button type="submit">{editingEmployee ? "Enregistrer" : "Ajouter"}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="p-8 overflow-x-auto">
                   <div className="flex justify-center">
                        <div className="inline-flex flex-col items-center gap-8">
                            {rootEmployees.map(root => (
                                <MemberNode key={root.id} member={root} allEmployees={employees} onEdit={handleOpenDialog} onDelete={handleDelete} />
                            ))}
                        </div>
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}

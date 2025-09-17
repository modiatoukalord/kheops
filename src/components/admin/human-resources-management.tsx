
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Users, Briefcase, DollarSign, User, Phone, Mail, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type EmployeeStatus = "Actif" | "En congé" | "Parti";
type EmployeeDepartment = "Administration" | "Studio" | "Marketing" | "Ventes" | "Culture" | "Wear" | "Autre";

export type Employee = {
    id: string;
    name: string;
    role: string;
    department: EmployeeDepartment;
    status: EmployeeStatus;
    startDate: Date;
    salary: number;
    phone: string;
    email: string;
};

const initialEmployees: Employee[] = [
    { id: "emp-001", name: "Fatou Diop", role: "Manager du Hub", department: "Administration", status: "Actif", startDate: new Date("2023-01-15"), salary: 450000, phone: "06 111 2233", email: "fatou.diop@kheops.dev" },
    { id: "emp-002", name: "Moussa Traoré", role: "Ingénieur du Son Principal", department: "Studio", status: "Actif", startDate: new Date("2023-02-01"), salary: 350000, phone: "06 222 3344", email: "moussa.traore@kheops.dev" },
    { id: "emp-003", name: "Aïcha Diallo", role: "Responsable Contenu", department: "Culture", status: "Actif", startDate: new Date("2023-03-10"), salary: 250000, phone: "06 333 4455", email: "aicha.diallo@kheops.dev" },
    { id: "emp-004", name: "Issa Cissokho", role: "Chef de Produit", department: "Wear", status: "Actif", startDate: new Date("2023-04-01"), salary: 300000, phone: "06 444 5566", email: "issa.cissokho@kheops.dev" },
];

const statusConfig: { [key in EmployeeStatus]: { variant: "default" | "secondary" | "outline", color: string } } = {
    "Actif": { variant: "default", color: "bg-green-500/80 text-white" },
    "En congé": { variant: "outline", color: "border-yellow-500 text-yellow-500" },
    "Parti": { variant: "secondary", color: "bg-muted text-muted-foreground" },
};

const departmentColors: { [key in EmployeeDepartment]: string } = {
    "Administration": "bg-blue-500/20 text-blue-700 border-blue-500/30",
    "Studio": "bg-purple-500/20 text-purple-700 border-purple-500/30",
    "Culture": "bg-orange-500/20 text-orange-700 border-orange-500/30",
    "Wear": "bg-teal-500/20 text-teal-700 border-teal-500/30",
    "Marketing": "bg-pink-500/20 text-pink-700 border-pink-500/30",
    "Ventes": "bg-green-500/20 text-green-700 border-green-500/30",
    "Autre": "bg-gray-500/20 text-gray-700 border-gray-500/30",
};


export default function HumanResourcesManagement() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const { toast } = useToast();

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        const employeeData = {
            name: formData.get("name") as string,
            role: formData.get("role") as string,
            department: formData.get("department") as EmployeeDepartment,
            status: "Actif" as EmployeeStatus,
            startDate: parseISO(formData.get("startDate") as string),
            salary: Number(formData.get("salary")),
            phone: formData.get("phone") as string,
            email: formData.get("email") as string,
        };

        if (editingEmployee) {
            const updatedEmployee = { ...editingEmployee, ...employeeData };
            setEmployees(employees.map(e => e.id === editingEmployee.id ? updatedEmployee : e));
            toast({
                title: "Employé Modifié",
                description: `Les informations de ${updatedEmployee.name} ont été mises à jour.`,
            });
        } else {
            const newEmployee = { id: `emp-${Date.now()}`, ...employeeData };
            setEmployees([...employees, newEmployee]);
            toast({
                title: "Employé Ajouté",
                description: `${newEmployee.name} a été ajouté à l'équipe.`,
            });
        }
        setDialogOpen(false);
        setEditingEmployee(null);
    };

    const handleOpenDialog = (employee: Employee | null) => {
        setEditingEmployee(employee);
        setDialogOpen(true);
    };

    const handleDeleteEmployee = (employeeId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir archiver cet employé ?")) {
            setEmployees(employees.map(e => e.id === employeeId ? { ...e, status: "Parti" } : e));
            toast({
                title: "Employé Archivé",
                variant: "destructive",
            });
        }
    };

    const totalEmployees = employees.filter(e => e.status === 'Actif').length;
    const monthlyPayroll = employees.filter(e => e.status === 'Actif').reduce((sum, e) => sum + e.salary, 0);

    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nombre d'Employés Actifs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">Total des membres de l'équipe</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Masse Salariale Mensuelle</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyPayroll.toLocaleString('fr-FR')} FCFA</div>
                        <p className="text-xs text-muted-foreground">Estimation des salaires mensuels</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Postes Ouverts</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Ingénieur Son, Stagiaire Marketing</p>
                    </CardContent>
                </Card>
            </section>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Personnel KHEOPS</CardTitle>
                            <CardDescription>Liste complète des membres de l'équipe et de leurs rôles.</CardDescription>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Date d'embauche</Label>
                                            <Input id="startDate" name="startDate" type="date" defaultValue={editingEmployee ? format(editingEmployee.startDate, 'yyyy-MM-dd') : ''} required />
                                        </div>
                                    </div>
                                    <DialogFooter className="pt-4 border-t">
                                        <Button type="submit">{editingEmployee ? "Enregistrer" : "Ajouter"}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Département</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date d'embauche</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map(employee => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <div className="font-medium">{employee.name}</div>
                                        <div className="text-xs text-muted-foreground">{employee.email}</div>
                                    </TableCell>
                                    <TableCell>{employee.role}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={departmentColors[employee.department]}>
                                            {employee.department}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusConfig[employee.status].variant} className={statusConfig[employee.status].color}>
                                            {employee.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(employee.startDate, "d MMM yyyy", { locale: fr })}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(employee)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteEmployee(employee.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Archiver
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

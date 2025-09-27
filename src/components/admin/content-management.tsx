
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Filter,
  BookOpen,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  Film,
  Puzzle,
  BookCopy,
  DiscAlbum,
  UploadCloud,
  Shirt,
  DollarSign,
  ImageIcon,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { WearCategory } from "@/components/admin/pricing-settings";


export const initialContent: Content[] = [];

export type Content = {
    id: string;
    title: string;
    type: "Livre" | "Article" | "Manga" | "Film" | "Jeu de société" | "Projet Studio" | "Produit Wear";
    author: string; // Doubles as price for "Produit Wear"
    status: "Publié" | "Brouillon";
    lastUpdated: string;
    imageUrls?: string[];
    summary?: string;
    wearCategory?: string;
};
type ContentStatus = Content["status"];
type ContentType = Content["type"];


const statusConfig = {
  Publié: { variant: "default", icon: CheckCircle },
  Brouillon: { variant: "secondary", icon: Edit },
};

const typeConfig: { [key in ContentType]: { icon: React.ElementType, label: string } } = {
  Livre: { icon: BookOpen, label: "Livre" },
  Article: { icon: FileText, label: "Article" },
  Manga: { icon: BookCopy, label: "Manga" },
  Film: { icon: Film, label: "Film" },
  "Jeu de société": { icon: Puzzle, label: "Jeu de société" },
  "Projet Studio": { icon: DiscAlbum, label: "Projet Studio" },
  "Produit Wear": { icon: Shirt, label: "Produit Wear" },
};

interface ContentManagementProps {
  content: Content[];
  onAddContent: (content: Omit<Content, 'id'>) => Promise<void>;
  onUpdateContent: (id: string, content: Partial<Omit<Content, 'id'>>) => Promise<void>;
  onDeleteContent: (id: string) => Promise<void>;
}


export default function ContentManagement({ content, onAddContent, onUpdateContent, onDeleteContent }: ContentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const { toast } = useToast();
  const [typeFilters, setTypeFilters] = useState<ContentType[]>([]);
  const [statusFilters, setStatusFilters] = useState<ContentStatus[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<ContentType>('Article');
  const [wearCategories, setWearCategories] = useState<WearCategory[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "wearCategories"), (snapshot) => {
      setWearCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WearCategory)));
    });
    return () => unsub();
  }, []);
  
  useEffect(() => {
    if (editingContent) {
        setSelectedType(editingContent.type);
        setPreviewImages(editingContent.imageUrls || []);
    }
  }, [editingContent]);

  const handleAddContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const type = formData.get("type") as Content["type"];
    
    const newContent: Partial<Omit<Content, 'id'>> = {
      title,
      type,
      author: formData.get("author") as string, // This is also used for price
      status: "Brouillon",
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    if (previewImages.length > 0) {
      newContent.imageUrls = previewImages;
    }
    
    const summary = formData.get("summary") as string;
    if (summary) {
        newContent.summary = summary;
    }

    const wearCategory = formData.get("wearCategory") as Content["wearCategory"];
    if (type === 'Produit Wear' && wearCategory) {
        newContent.wearCategory = wearCategory;
    }

    await onAddContent(newContent as Omit<Content, 'id'>);
    toast({
      title: "Contenu Ajouté",
      description: `Le contenu "${title}" a été ajouté comme brouillon.`,
    });
    setAddDialogOpen(false);
    setPreviewImages([]);
  };

  const handleEditContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingContent) return;

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const type = formData.get("type") as Content["type"];
    
    const updatedContent: Partial<Omit<Content, 'id'>> = {
      title,
      type,
      author: formData.get("author") as string,
      lastUpdated: new Date().toISOString().split("T")[0],
      imageUrls: previewImages,
      summary: formData.get("summary") as string || '',
    };
    
    const wearCategory = formData.get("wearCategory") as Content["wearCategory"];
    if (type === 'Produit Wear' && wearCategory) {
        updatedContent.wearCategory = wearCategory;
    } else {
        updatedContent.wearCategory = ''; // Or remove field logic
    }
    
    await onUpdateContent(editingContent.id, updatedContent);
    toast({
      title: "Contenu Modifié",
      description: `Le contenu "${title}" a été mis à jour.`,
    });

    setEditDialogOpen(false);
    setEditingContent(null);
    setPreviewImages([]);
  };
  
  const handleOpenEditDialog = (item: Content) => {
    setEditingContent(item);
    setEditDialogOpen(true);
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const newImages: string[] = [];

      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === fileArray.length) {
            setPreviewImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };


  const handleStatusChange = async (id: string, status: ContentStatus) => {
    await onUpdateContent(id, { status, lastUpdated: new Date().toISOString().split("T")[0] });
    toast({
        title: "Statut mis à jour",
        description: `Le contenu a été marqué comme ${status.toLowerCase()}.`
    })
  };
  
  const handleCategoryChange = async (id: string, wearCategory: Content['wearCategory']) => {
    await onUpdateContent(id, { wearCategory, lastUpdated: new Date().toISOString().split("T")[0] });
     toast({
        title: "Catégorie mise à jour",
        description: `La catégorie a été mise à jour.`,
        duration: 2000,
    })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      await onDeleteContent(id);
      toast({
        title: "Contenu Supprimé",
        variant: "destructive"
      });
    }
  }

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilters.length === 0 || typeFilters.includes(item.type);
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.status);

    return matchesSearch && matchesType && matchesStatus;
  });
  
  const renderFormContent = (isEditing: boolean) => {
    const defaultValues = isEditing ? editingContent : null;
    return (
        <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" placeholder="Titre du contenu" required defaultValue={defaultValues?.title} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="type">Type de contenu</Label>
            <Select name="type" required defaultValue={selectedType} onValueChange={(value) => setSelectedType(value as ContentType)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
                <SelectContent>
                {Object.entries(typeConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
            <Label htmlFor="author">{selectedType === 'Produit Wear' ? 'Prix' : 'Auteur / Créateur'}</Label>
            <div className="relative">
                {selectedType === 'Produit Wear' && <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                <Input
                    id="author"
                    name="author"
                    placeholder={selectedType === 'Produit Wear' ? 'Ex: 25000' : 'Nom du créateur'}
                    type={selectedType === 'Produit Wear' ? 'number' : 'text'}
                    className={selectedType === 'Produit Wear' ? 'pl-10' : ''}
                    required
                    defaultValue={defaultValues?.author}
                />
            </div>
            </div>
        </div>
        {selectedType === 'Produit Wear' && (
            <div className="space-y-2">
                <Label htmlFor="wearCategory">Catégorie Wear</Label>
                <Select name="wearCategory" defaultValue={defaultValues?.wearCategory}>
                    <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                    {wearCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        )}
        <div className="space-y-2">
            <Label htmlFor="image">Images</Label>
            <Input id="image" name="image" type="file" onChange={handleImageChange} accept="image/*" multiple />
            <p className="text-xs text-muted-foreground mt-1">plusieurs images peuvent etre televerser pour le même élement.</p>
            {previewImages.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
                {previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                        <Image src={image} alt={`Aperçu ${index+1}`} width={100} height={100} className="h-24 w-24 object-cover rounded-md border" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>
            )}
        </div>
            <div className="space-y-2">
            <Label htmlFor="summary">Résumé (Optionnel)</Label>
            <Textarea id="summary" name="summary" placeholder="Bref résumé du contenu..." defaultValue={defaultValues?.summary}/>
        </div>
        </div>
    )
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Gestion des Contenus</CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez des livres, articles, produits et autres contenus.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou auteur..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrer par Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(typeConfig).map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilters.includes(type as ContentType)}
                    onCheckedChange={(checked) =>
                      setTypeFilters(
                        checked
                          ? [...typeFilters, type as ContentType]
                          : typeFilters.filter((t) => t !== type)
                      )
                    }
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrer par Statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(statusConfig).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.includes(status as ContentStatus)}
                    onCheckedChange={(checked) =>
                      setStatusFilters(
                        checked
                          ? [...statusFilters, status as ContentStatus]
                          : statusFilters.filter((s) => s !== status)
                      )
                    }
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setPreviewImages([]); setAddDialogOpen(isOpen); }}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleAddContent}>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau contenu</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations pour créer une nouvelle oeuvre.
                    </DialogDescription>
                  </DialogHeader>
                  {renderFormContent(false)}
                  <DialogFooter>
                    <Button type="submit">Ajouter comme Brouillon</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setPreviewImages([]); setEditingContent(null); } setEditDialogOpen(isOpen); }}>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleEditContent}>
                  <DialogHeader>
                    <DialogTitle>Modifier le contenu</DialogTitle>
                    <DialogDescription>
                      Mettez à jour les informations pour "{editingContent?.title}".
                    </DialogDescription>
                  </DialogHeader>
                  {renderFormContent(true)}
                  <DialogFooter>
                    <Button type="submit">Enregistrer les modifications</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Auteur/Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière màj</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => {
                  const statusInfo = statusConfig[item.status];
                  const typeInfo = typeConfig[item.type];
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                          {item.imageUrls && item.imageUrls.length > 0 ? (
                              <Image src={item.imageUrls[0]} alt={item.title} width={40} height={40} className="rounded-md object-cover h-10 w-10 border"/>
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded-md border flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <typeInfo.icon className="h-4 w-4 text-muted-foreground" />
                           {typeInfo.label}
                        </div>
                      </TableCell>
                       <TableCell>
                        {item.type === 'Produit Wear' ? (
                          <Select
                            value={item.wearCategory}
                            onValueChange={(value) => handleCategoryChange(item.id, value)}
                          >
                            <SelectTrigger className="w-[150px] h-8 text-xs">
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                              {wearCategories.map(cat => <SelectItem key={cat.id} value={cat.name} className="text-xs">{cat.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.type === 'Produit Wear' ? `${Number(item.author).toLocaleString('fr-FR')} FCFA` : item.author}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.lastUpdated).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Prévisualiser
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'Publié')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Publier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Aucun contenu trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

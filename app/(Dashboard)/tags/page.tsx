"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { FilePenLine, Pencil, EllipsisVertical } from "lucide-react"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface Client {
  name: string;
  email: string;
  address: string;
  note: string;
  currency: string;
}

const TagsPage = () => {
  const [name, setName] = useState<string>("")
  const [clients, setClients] = useState<Client[]>([])
  const [archiveClient, setArchiveClient] = useState<string | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [editForm, setEditForm] = useState<Client>({
    name: "",
    email: "",
    address: "",
    note: "",
    currency: "USD"
  })

  // Charger les clients depuis le localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('clients')
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    }
  }, [])

  // Sauvegarder les clients dans le localStorage
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients))
  }, [clients])

  const handleAddClient = () => {
    if (name.trim().length === 0) return
    const newClient: Client = {
      name: name.trim(),
      email: "",
      address: "",
      note: "",
      currency: "USD"
    }
    setClients([...clients, newClient])
    setName("")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddClient()
    }
  }

  // Ouvrir le modal d'édition et initialiser le formulaire
  const handleEditClick = (client: Client) => {
    setEditClient(client)
    setEditForm(client)
  }

  // Fermer le modal d'édition
  const handleCloseEdit = () => {
    setEditClient(null)
    setEditForm({
      name: "",
      email: "",
      address: "",
      note: "",
      currency: "USD"
    })
  }

  // Gérer les changements dans le formulaire d'édition
  const handleEditChange = (field: keyof Client, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    if (!editClient || !editForm.name.trim()) return
    
    const updatedClients = clients.map(client => 
      client.name === editClient.name ? editForm : client
    )
    
    setClients(updatedClients)
    handleCloseEdit()
  }

  // Gérer la touche Entrée dans le modal d'édition
  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-16 p-6">
      <h1 className="text-2xl text-gray-400">Tags</h1>

      {/* SI PAS DE CLIENT → interface initiale */}
      {clients.length === 0 ? (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-4 w-full justify-center items-center mt-15">
            <h2 className="text-2xl">Organize your entries with tags</h2>
            <p className="text-gray-400">
             Use tags to add an additional information to time entries, and get more data insights with reports.
            </p>
            <div className="flex gap-1">
              <Input
                type="text"
                placeholder="Add new tag"
                className="w-80"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <Button
                variant="default"
                className="bg-blue-500 text-white w-20"
                onClick={handleAddClient}
                disabled={name.length === 0}
              >
                Add
              </Button>
            </div>
          </div>
          <Image src='/img22.PNG' alt='Clients' width={700} height={700} className='mx-auto'/>
        </div>
      ) : (
        // SI AU MOINS 1 CLIENT → tableau
        <div className="bg-gray-50 border rounded-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-2">
              <select className="border rounded px-2 py-1 text-sm text-gray-500">
                <option>Show active</option>
              </select>
              <Input
                type="text"
                placeholder="Search by name"
                className="w-60"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add new Tag"
                className="w-60"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <Button
                className="bg-sky-400 text-white px-6"
                onClick={handleAddClient}
                disabled={name.length === 0}
              >
                ADD
              </Button>
            </div>
          </div>

          {/* Tableau clients */}
          <table className="w-full border-t">
            <thead className="bg-gray-100 text-gray-500 text-sm">
              <tr>
                <th className="p-2 text-left">NAME</th>
                <th className="p-2 text-left">ADDRESS</th>
                <th className="p-2 text-left">CURRENCY</th>
                <th className="p-2 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{client.name}</td>
                  <td className="p-2">{client.address || "-"}</td>
                  <td className="p-2">{client.currency}</td>
                  <td className="p-2 flex gap-2 justify-end">
                    <FilePenLine className="w-5 h-5 text-gray-500" />
                    <Pencil
                      className="w-5 h-5 text-gray-500 cursor-pointer"
                      onClick={() => handleEditClick(client)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <EllipsisVertical className="w-5 h-5 text-gray-500 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setArchiveClient(client.name)}
                        >
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Archive */}
      <Dialog open={!!archiveClient} onOpenChange={() => setArchiveClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive {archiveClient}</DialogTitle>
            <DialogDescription>
              {archiveClient} won&apos;t be available when tracking time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setArchiveClient(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white"
              onClick={() => {
                setClients(clients.filter(c => c.name !== archiveClient))
                setArchiveClient(null)
              }}
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog open={!!editClient} onOpenChange={handleCloseEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4" onKeyDown={handleEditKeyPress}>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="col-span-3"
                placeholder="Enter client name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditChange('email', e.target.value)}
                className="col-span-3"
                placeholder="Enter email"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => handleEditChange('address', e.target.value)}
                className="col-span-3"
                placeholder="Enter address"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Textarea
                id="note"
                value={editForm.note}
                onChange={(e) => handleEditChange('note', e.target.value)}
                className="col-span-3"
                placeholder="Enter note"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Select
                value={editForm.currency}
                onValueChange={(value) => handleEditChange('currency', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={!editForm.name.trim()}
              className="bg-blue-500 text-white"
            >
              SAVE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TagsPage
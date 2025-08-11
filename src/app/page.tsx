'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Building2, Users, Calculator, FileText, Plus, Download, Edit, Trash2, Info } from 'lucide-react'
import jsPDF from 'jspdf'

interface House {
  id: string
  name: string
  address?: string
  apartments: Apartment[]
}

interface Apartment {
  id: string
  apartmentNo: string
  tenantName: string
  livingArea: number
}

export default function Home() {
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showHouseDialog, setShowHouseDialog] = useState(false)

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      const response = await fetch('/api/houses')
      if (response.ok) {
        const data = await response.json()
        setHouses(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Häuser:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-house':
        setShowHouseDialog(true)
        break
      case 'add-apartment':
        setActiveTab('houses')
        break
      case 'add-meter-reading':
        setActiveTab('meter-readings')
        break
      case 'create-billing':
        setActiveTab('billing')
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nebenkostenabrechnung</h1>
        <p className="text-gray-600">Verwaltung der Nebenkosten für Mehrfamilienhäuser</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="houses">Häuser</TabsTrigger>
          <TabsTrigger value="meter-readings">Zählerstände</TabsTrigger>
          <TabsTrigger value="billing">Abrechnung</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Häuser</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{houses.length}</div>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wohneinheiten</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {houses.reduce((sum, house) => sum + house.apartments.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wohnfläche</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {houses.reduce((sum, house) => 
                    sum + house.apartments.reduce((apartmentSum, apartment) => apartmentSum + apartment.livingArea, 0), 0
                  ).toFixed(0)} m²
                </div>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <p className="text-xs text-muted-foreground">System</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Häuser</CardTitle>
                <CardDescription>Ihre Mehrfamilienhäuser</CardDescription>
              </CardHeader>
              <CardContent>
                {houses.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">Noch keine Häuser vorhanden</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Erstes Haus hinzufügen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {houses.map((house) => (
                      <div key={house.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{house.name}</h3>
                          <p className="text-sm text-gray-500">{house.address}</p>
                          <p className="text-xs text-gray-400">
                            {house.apartments.length} Wohneinheiten
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {house.apartments.length} Einheiten
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
                <CardDescription>Häufig verwendete Funktionen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('add-house')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Haus hinzufügen
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('add-apartment')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Wohneinheit hinzufügen
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('add-meter-reading')}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Zählerstände erfassen
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('create-billing')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Abrechnung erstellen
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <HouseFormDialog 
          open={showHouseDialog} 
          onOpenChange={setShowHouseDialog}
          onHouseCreated={fetchHouses} 
        />

        <TabsContent value="houses">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Hausverwaltung</CardTitle>
                    <CardDescription>Verwalten Sie Ihre Häuser und Wohneinheiten</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <HousesSectionHouseFormDialog onHouseCreated={fetchHouses} />
                    {houses.length > 0 && (
                      <ApartmentFormDialog houseId={houses[0].id} onApartmentCreated={fetchHouses} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {houses.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">Noch keine Häuser vorhanden</p>
                    <HousesSectionHouseFormDialog onHouseCreated={fetchHouses} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {houses.map((house) => (
                      <HouseCard key={house.id} house={house} onHouseUpdated={fetchHouses} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meter-readings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zählerstände</CardTitle>
                <CardDescription>Erfassen Sie die Zählerstände für alle Kostenarten</CardDescription>
              </CardHeader>
              <CardContent>
                <MeterReadingForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zuletzt erfasste Zählerstände</CardTitle>
                <CardDescription>Übersicht der letzten Zählerstandeingaben</CardDescription>
              </CardHeader>
              <CardContent>
                <MeterReadingsList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verbrauchsberechnung</CardTitle>
                <CardDescription>Berechnung des Verbrauchs aus Zählerdifferenzen</CardDescription>
              </CardHeader>
              <CardContent>
                <ConsumptionCalculator />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gesamtkosten</CardTitle>
                <CardDescription>Erfassen Sie die jährlichen Gesamtkosten für jede Kostenart</CardDescription>
              </CardHeader>
              <CardContent>
                <TotalCostsForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kostenübersicht</CardTitle>
                <CardDescription>Übersicht aller erfassten Gesamtkosten</CardDescription>
              </CardHeader>
              <CardContent>
                <TotalCostsList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vorauszahlungen</CardTitle>
                <CardDescription>Erfassen Sie die jährlichen Vorauszahlungen der Mietparteien</CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancePaymentsForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vorauszahlungsübersicht</CardTitle>
                <CardDescription>Übersicht aller erfassten Vorauszahlungen</CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancePaymentsList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kostenanteilsberechnung</CardTitle>
                <CardDescription>Berechnung der individuellen Kostenanteile und Salden</CardDescription>
              </CardHeader>
              <CardContent>
                <CostAllocationCalculator />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  )
}

interface HouseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHouseCreated: () => void
}

function HouseFormDialog({ open, onOpenChange, onHouseCreated }: HouseFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/houses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', address: '', description: '' })
        onOpenChange(false)
        onHouseCreated()
      } else {
        console.error('Fehler beim Erstellen des Hauses')
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Neues Haus hinzufügen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Name *
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Geben Sie den Namen des Gebäudes ein. Dies wird als Hauptbezeichnung für die Verwaltung verwendet.</p>
                      <p className="text-xs text-gray-500 mt-1">Beispiel: "Musterstraße 15" oder "Wohnanlage am Park"</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Adresse
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Vollständige Adresse des Gebäudes mit Straßenname, Hausnummer, PLZ und Stadt.</p>
                      <p className="text-xs text-gray-500 mt-1">Beispiel: "Musterstraße 15, 12345 Berlin"</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Beschreibung
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Zusätzliche Informationen zum Gebäude wie Baujahr, Anzahl der Etagen, besondere Merkmale etc.</p>
                      <p className="text-xs text-gray-500 mt-1">Beispiel: "Baujahr 1995, 4 Etagen, 12 Wohneinheiten"</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Wird erstellt...' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

interface Apartment {
  id: string
  apartmentNo: string
  tenantName: string
  livingArea: number
}

interface ApartmentCardProps {
  apartment: Apartment
  onApartmentUpdated: () => void
}

function ApartmentCard({ apartment, onApartmentUpdated }: ApartmentCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Möchten Sie die Wohneinheit "${apartment.apartmentNo}" wirklich löschen?`)) {
      return
    }

    try {
      const response = await fetch(`/api/apartments?id=${apartment.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onApartmentUpdated()
      } else {
        alert('Fehler beim Löschen der Wohneinheit')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Löschen der Wohneinheit')
    }
  }

  return (
    <>
      <div className="p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Wohnung {apartment.apartmentNo}</span>
              <Badge variant="outline" className="text-xs">
                {apartment.livingArea} m²
              </Badge>
            </div>
            <div className="text-sm text-gray-600">{apartment.tenantName}</div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <ApartmentEditDialog 
        apartment={apartment}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onApartmentUpdated={onApartmentUpdated}
      />
    </>
  )
}

interface ApartmentEditDialogProps {
  apartment: Apartment
  open: boolean
  onOpenChange: (open: boolean) => void
  onApartmentUpdated: () => void
}

function ApartmentEditDialog({ apartment, open, onOpenChange, onApartmentUpdated }: ApartmentEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [houses, setHouses] = useState<House[]>([])
  const [formData, setFormData] = useState({
    apartmentNo: apartment.apartmentNo,
    tenantName: apartment.tenantName,
    livingArea: apartment.livingArea.toString(),
    houseId: ''
  })

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      const response = await fetch('/api/houses')
      if (response.ok) {
        const data = await response.json()
        setHouses(data)
        // Find the current house for this apartment
        const apartmentResponse = await fetch(`/api/apartments?id=${apartment.id}`)
        if (apartmentResponse.ok) {
          const apartmentData = await apartmentResponse.json()
          setFormData(prev => ({
            ...prev,
            houseId: apartmentData.houseId
          }))
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Häuser:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/apartments?id=${apartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onOpenChange(false)
        onApartmentUpdated()
      } else {
        console.error('Fehler beim Aktualisieren der Wohneinheit')
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Wohneinheit bearbeiten</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Haus *
                </label>
                <select
                  required
                  value={formData.houseId}
                  onChange={(e) => setFormData({ ...formData, houseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wohnungsnummer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apartmentNo}
                  onChange={(e) => setFormData({ ...formData, apartmentNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mietername *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name des Mieters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wohnfläche (m²) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.livingArea}
                  onChange={(e) => setFormData({ ...formData, livingArea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 75.5"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Wird aktualisiert...' : 'Aktualisieren'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function HousesSectionHouseFormDialog({ onHouseCreated }: { onHouseCreated: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Neues Haus
      </Button>
      
      <HouseFormDialog 
        open={open} 
        onOpenChange={setOpen}
        onHouseCreated={onHouseCreated} 
      />
    </>
  )
}

function ApartmentFormDialog({ houseId, onApartmentCreated }: { houseId: string; onApartmentCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [houses, setHouses] = useState<House[]>([])
  const [formData, setFormData] = useState({
    apartmentNo: '',
    tenantName: '',
    livingArea: '',
    houseId: houseId
  })

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      const response = await fetch('/api/houses')
      if (response.ok) {
        const data = await response.json()
        setHouses(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Häuser:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/apartments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ apartmentNo: '', tenantName: '', livingArea: '', houseId: houseId })
        setOpen(false)
        onApartmentCreated()
      } else {
        console.error('Fehler beim Erstellen der Wohneinheit')
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Wohneinheit
      </Button>
      
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Neue Wohneinheit hinzufügen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Haus *
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Wählen Sie das Gebäude aus, zu dem die Wohneinheit gehört.</p>
                      <p className="text-xs text-gray-500 mt-1">Jede Wohneinheit muss genau einem Gebäude zugeordnet sein.</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <select
                  required
                  value={formData.houseId}
                  onChange={(e) => setFormData({ ...formData, houseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Wohnungsnummer *
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Eindeutige Nummer der Wohnung innerhalb des Gebäudes.</p>
                      <p className="text-xs text-gray-500 mt-1">Beispiel: "101", "205", "EG1" (Erdgeschoss 1)</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  required
                  value={formData.apartmentNo}
                  onChange={(e) => setFormData({ ...formData, apartmentNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Mietername *
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Vollständiger Name des Hauptmieters der Wohnung.</p>
                      <p className="text-xs text-gray-500 mt-1">Beispiel: "Max Mustermann" oder "Schmidt-Familie"</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  required
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name des Mieters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Wohnfläche (m²) *
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Netto-Wohnfläche der Wohnung in Quadratmetern.</p>
                      <p className="text-xs text-gray-500 mt-1">Wichtig für die Kostenverteilung. Beispiel: "75.5" für 75,5 m²</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.livingArea}
                  onChange={(e) => setFormData({ ...formData, livingArea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 75.5"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Wird erstellt...' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

interface HouseCardProps {
  house: House
  onHouseUpdated: () => void
}

function HouseCard({ house, onHouseUpdated }: HouseCardProps) {
  const [showApartments, setShowApartments] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Möchten Sie das Haus "${house.name}" wirklich löschen?`)) {
      return
    }

    try {
      const response = await fetch(`/api/houses?id=${house.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onHouseUpdated()
      } else {
        alert('Fehler beim Löschen des Hauses')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Löschen des Hauses')
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {house.name}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {house.apartments.length} Einheiten
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          {house.address && (
            <CardDescription>{house.address}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gesamtfläche:</span>
              <span className="font-medium">
                {house.apartments.reduce((sum, apartment) => sum + apartment.livingArea, 0).toFixed(1)} m²
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApartments(!showApartments)}
                className="flex-1"
              >
                {showApartments ? 'Wohneinheiten ausblenden' : 'Wohneinheiten anzeigen'}
              </Button>
              <ApartmentFormDialog houseId={house.id} onApartmentCreated={onHouseUpdated} />
            </div>

            {showApartments && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {house.apartments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Noch keine Wohneinheiten vorhanden
                  </div>
                ) : (
                  house.apartments.map((apartment) => (
                    <ApartmentCard 
                      key={apartment.id} 
                      apartment={apartment} 
                      onApartmentUpdated={onHouseUpdated} 
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <HouseEditDialog 
        house={house}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onHouseUpdated={onHouseUpdated}
      />
    </>
  )
}

interface HouseEditDialogProps {
  house: House
  open: boolean
  onOpenChange: (open: boolean) => void
  onHouseUpdated: () => void
}

function HouseEditDialog({ house, open, onOpenChange, onHouseUpdated }: HouseEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: house.name,
    address: house.address || '',
    description: house.description || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/houses?id=${house.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onOpenChange(false)
        onHouseUpdated()
      } else {
        console.error('Fehler beim Aktualisieren des Hauses')
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Haus bearbeiten</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Wird aktualisiert...' : 'Aktualisieren'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

interface MeterReading {
  id: string
  apartmentId: string
  costType: string
  reading: number
  date: string
  year: number
  apartment: {
    id: string
    apartmentNo: string
    tenantName: string
    house: {
      id: string
      name: string
    }
  }
}

interface ApartmentExtended {
  id: string
  apartmentNo: string
  tenantName: string
  livingArea: number
  house: {
    id: string
    name: string
  }
}

function MeterReadingForm() {
  const [loading, setLoading] = useState(false)
  const [apartments, setApartments] = useState<ApartmentExtended[]>([])
  const [formData, setFormData] = useState({
    apartmentId: '',
    costType: 'COLD_WATER',
    reading: '',
    date: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear()
  })

  const costTypeLabels = {
    COLD_WATER: 'Kaltwasser',
    WARM_WATER: 'Warmwasser',
    HEATING: 'Wärmezähler',
    WASHING_MACHINE: 'Waschmaschine'
  }

  useEffect(() => {
    fetchApartments()
  }, [])

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments')
      if (response.ok) {
        const data = await response.json()
        setApartments(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Wohneinheiten:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/meter-readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          apartmentId: '',
          costType: 'COLD_WATER',
          reading: '',
          date: new Date().toISOString().split('T')[0],
          year: new Date().getFullYear()
        })
        // Trigger refresh of meter readings list
        window.dispatchEvent(new CustomEvent('meterReadingsUpdated'))
      } else {
        console.error('Fehler beim Speichern des Zählerstands')
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Wohneinheit *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Wählen Sie die Wohnung aus, für die Sie den Zählerstand erfassen möchten.</p>
              <p className="text-xs text-gray-500 mt-1">Format: Gebäude - Wohnung (Mieter)</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <select
          required
          value={formData.apartmentId}
          onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Wählen Sie eine Wohneinheit</option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              {apartment.house.name} - Wohnung {apartment.apartmentNo} ({apartment.tenantName})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Kostenart *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Art des Zählers oder der Kostenposition.</p>
              <p className="text-xs text-gray-500 mt-1">Kaltwasser=Hauptwasserzähler, Warmwasser=Boiler, Wärmezähler=Heizung</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <select
          required
          value={formData.costType}
          onChange={(e) => setFormData({ ...formData, costType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(costTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Zählerstand *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Aktueller Zählerstand als Dezimalzahl.</p>
              <p className="text-xs text-gray-500 mt-1">Beispiel: "125.75" für 125,75 Einheiten. Komma mit Punkt schreiben!</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <input
          type="number"
          step="0.01"
          required
          value={formData.reading}
          onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Datum *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Datum der Zählerablesung.</p>
              <p className="text-xs text-gray-500 mt-1">Wichtig: Jahresendablesungen immer am 31.12. erfassen!</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Jahr *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Abrechnungsjahr für diese Zählerablesung.</p>
              <p className="text-xs text-gray-500 mt-1">Verbrauchsberechnung benötigt Vorjahr und Aktuelles Jahr!</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <input
          type="number"
          required
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="2024"
        />
      </div>

      <div className="md:col-span-2 lg:col-span-5">
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? 'Wird gespeichert...' : 'Zählerstand speichern'}
        </Button>
      </div>
    </form>
  )
}

function MeterReadingsList() {
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReading, setEditingReading] = useState<MeterReading | null>(null)

  const costTypeLabels = {
    COLD_WATER: 'Kaltwasser',
    WARM_WATER: 'Warmwasser',
    HEATING: 'Wärmezähler',
    WASHING_MACHINE: 'Waschmaschine'
  }

  const fetchMeterReadings = async () => {
    try {
      const response = await fetch('/api/meter-readings')
      if (response.ok) {
        const data = await response.json()
        setMeterReadings(data.slice(0, 20)) // Show last 20 readings
      }
    } catch (error) {
      console.error('Fehler beim Laden der Zählerstände:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Zählerstand wirklich löschen?')) {
      return
    }

    try {
      const response = await fetch(`/api/meter-readings?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchMeterReadings()
      } else {
        alert('Fehler beim Löschen des Zählerstands')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Löschen des Zählerstands')
    }
  }

  useEffect(() => {
    fetchMeterReadings()
    
    const handleUpdate = () => fetchMeterReadings()
    window.addEventListener('meterReadingsUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('meterReadingsUpdated', handleUpdate)
    }
  }, [])

  if (loading) {
    return <div className="text-center py-4">Lade Zählerstände...</div>
  }

  if (meterReadings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Noch keine Zählerstände erfasst</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {meterReadings.map((reading) => (
        <div key={reading.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="font-medium">
              {reading.apartment.house.name} - Wohnung {reading.apartment.apartmentNo}
            </div>
            <div className="text-sm text-gray-500">
              {reading.apartment.tenantName}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(reading.date).toLocaleDateString('de-DE')}
            </div>
          </div>
          <div className="text-right mr-4">
            <div className="font-medium">
              {costTypeLabels[reading.costType as keyof typeof costTypeLabels]}
            </div>
            <div className="text-lg font-bold text-blue-600">
              {reading.reading.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Jahr {reading.year}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingReading(reading)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(reading.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      {editingReading && (
        <MeterReadingEditDialog
          reading={editingReading}
          open={!!editingReading}
          onOpenChange={(open) => !open && setEditingReading(null)}
          onReadingUpdated={fetchMeterReadings}
        />
      )}
    </div>
  )
}

interface MeterReadingEditDialogProps {
  reading: MeterReading
  open: boolean
  onOpenChange: (open: boolean) => void
  onReadingUpdated: () => void
}

function MeterReadingEditDialog({ reading, open, onOpenChange, onReadingUpdated }: MeterReadingEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [apartments, setApartments] = useState<ApartmentExtended[]>([])
  const [formData, setFormData] = useState({
    apartmentId: reading.apartmentId,
    costType: reading.costType,
    reading: reading.reading.toString(),
    date: new Date(reading.date).toISOString().split('T')[0],
    year: reading.year
  })

  const costTypeLabels = {
    COLD_WATER: 'Kaltwasser',
    WARM_WATER: 'Warmwasser',
    HEATING: 'Wärmezähler',
    WASHING_MACHINE: 'Waschmaschine'
  }

  useEffect(() => {
    fetchApartments()
  }, [])

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments')
      if (response.ok) {
        const data = await response.json()
        setApartments(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Wohneinheiten:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/meter-readings?id=${reading.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onOpenChange(false)
        onReadingUpdated()
      } else {
        console.error('Fehler beim Aktualisieren des Zählerstands')
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Zählerstand bearbeiten</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wohneinheit *
                </label>
                <select
                  required
                  value={formData.apartmentId}
                  onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {apartments.map((apartment) => (
                    <option key={apartment.id} value={apartment.id}>
                      {apartment.house.name} - Wohnung {apartment.apartmentNo} ({apartment.tenantName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kostenart *
                </label>
                <select
                  required
                  value={formData.costType}
                  onChange={(e) => setFormData({ ...formData, costType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(costTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zählerstand *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.reading}
                  onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jahr *
                </label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Wird aktualisiert...' : 'Aktualisieren'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

interface ConsumptionData {
  apartmentId: string
  apartmentNo: string
  tenantName: string
  houseName: string
  costType: string
  currentReading: number
  previousReading: number
  consumption: number
  currentReadingDate: string
  previousReadingDate: string
}

function ConsumptionCalculator() {
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    houseId: '',
    year: new Date().getFullYear().toString(),
    costType: ''
  })
  const [houses, setHouses] = useState<House[]>([])

  const costTypeLabels = {
    COLD_WATER: 'Kaltwasser',
    WARM_WATER: 'Warmwasser',
    HEATING: 'Wärmezähler',
    WASHING_MACHINE: 'Waschmaschine'
  }

  useEffect(() => {
    fetchHouses()
  }, [])

  useEffect(() => {
    if (filters.year) {
      calculateConsumption()
    }
  }, [filters.houseId, filters.year, filters.costType])

  const fetchHouses = async () => {
    try {
      const response = await fetch('/api/houses')
      if (response.ok) {
        const data = await response.json()
        setHouses(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Häuser:', error)
    }
  }

  const calculateConsumption = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.houseId) params.append('houseId', filters.houseId)
      if (filters.year) params.append('year', filters.year)
      if (filters.costType) params.append('costType', filters.costType)

      console.log('Fetching consumption with params:', params.toString())
      const response = await fetch(`/api/consumption?${params}`)
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Consumption data:', data)
        setConsumptionData(data)
      } else {
        console.error('Response not ok:', response)
      }
    } catch (error) {
      console.error('Fehler bei der Verbrauchsberechnung:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalConsumption = (costType: string) => {
    return consumptionData
      .filter(d => d.costType === costType)
      .reduce((sum, d) => sum + d.consumption, 0)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Haus
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Wählen Sie ein spezifisches Gebäude aus oder lassen Sie leer für alle Gebäude.</p>
                <p className="text-xs text-gray-500 mt-1">Leer = Verbrauch aller Gebäude anzeigen</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <select
            value={filters.houseId}
            onChange={(e) => setFilters({ ...filters, houseId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Häuser</option>
            {houses.map((house) => (
              <option key={house.id} value={house.id}>
                {house.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Jahr
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Abrechnungsjahr für die Verbrauchsberechnung.</p>
                <p className="text-xs text-gray-500 mt-1">Benötigt Zählerstände aus diesem und dem Vorjahr!</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <input
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Kostenart
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Filtern Sie nach einer spezifischen Kostenart oder zeigen Sie alle an.</p>
                <p className="text-xs text-gray-500 mt-1">Leer = alle Kostenarten anzeigen</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <select
            value={filters.costType}
            onChange={(e) => setFilters({ ...filters, costType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Kostenarten</option>
            {Object.entries(costTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={calculateConsumption} disabled={loading}>
          {loading ? 'Wird berechnet...' : 'Verbrauch berechnen'}
        </Button>
      </div>

      {consumptionData.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(costTypeLabels).map(([key, label]) => {
              const total = getTotalConsumption(key)
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {total.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Gesamtverbrauch</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Haus</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Wohnung</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mieter</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Kostenart</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Vorheriger Wert</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Aktueller Wert</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Verbrauch</th>
                </tr>
              </thead>
              <tbody>
                {consumptionData.map((data) => (
                  <tr key={`${data.apartmentId}-${data.costType}`} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{data.houseName}</td>
                    <td className="border border-gray-300 px-4 py-2">{data.apartmentNo}</td>
                    <td className="border border-gray-300 px-4 py-2">{data.tenantName}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {costTypeLabels[data.costType as keyof typeof costTypeLabels]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {data.previousReading.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {data.currentReading.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {data.consumption.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

interface TotalCost {
  id: string
  costType: string
  amount: number
  year: number
  createdAt: string
  updatedAt: string
}

function TotalCostsForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    costType: 'COLD_WATER',
    amount: '',
    year: new Date().getFullYear()
  })

  const costTypeLabels = {
    COLD_WATER: 'Kaltwasser',
    WARM_WATER: 'Warmwasser',
    HEATING: 'Wärmezähler',
    WASHING_MACHINE: 'Waschmaschine',
    INSURANCE: 'Versicherung',
    TAX: 'Steuer',
    CHIMNEY_SWEEPER: 'Kaminfeger'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/total-costs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          costType: 'COLD_WATER',
          amount: '',
          year: new Date().getFullYear()
        })
        // Trigger refresh of total costs list
        window.dispatchEvent(new CustomEvent('totalCostsUpdated'))
      } else {
        const error = await response.json()
        alert(error.error || 'Fehler beim Speichern der Gesamtkosten')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Speichern der Gesamtkosten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Kostenart *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Art der Kosten, die auf die Mieter umgelegt werden sollen.</p>
              <p className="text-xs text-gray-500 mt-1">Versicherung, Steuer, Kaminfeger sind fixe Kosten</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <select
          required
          value={formData.costType}
          onChange={(e) => setFormData({ ...formData, costType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(costTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Betrag (€) *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Gesamtkosten für diese Kostenart im gesamten Abrechnungsjahr.</p>
              <p className="text-xs text-gray-500 mt-1">Beispiel: "850.00" für 850€ Gesamtkosten. Punkt als Dezimaltrennzeichen!</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Jahr *
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Abrechnungsjahr für diese Gesamtkosten.</p>
              <p className="text-xs text-gray-500 mt-1">Muss mit dem Jahr der Zählerablesungen übereinstimmen!</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <input
          type="number"
          required
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="md:col-span-3">
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? 'Wird gespeichert...' : 'Gesamtkosten speichern'}
        </Button>
      </div>
    </form>
  )
}

function TotalCostsList() {
  const [totalCosts, setTotalCosts] = useState<TotalCost[]>([])
  const [loading, setLoading] = useState(true)

  const costTypeLabels = {
    COLD_WATER: 'Kaltwasser',
    WARM_WATER: 'Warmwasser',
    HEATING: 'Wärmezähler',
    WASHING_MACHINE: 'Waschmaschine',
    INSURANCE: 'Versicherung',
    TAX: 'Steuer',
    CHIMNEY_SWEEPER: 'Kaminfeger'
  }

  const fetchTotalCosts = async () => {
    try {
      const response = await fetch('/api/total-costs')
      if (response.ok) {
        const data = await response.json()
        setTotalCosts(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Gesamtkosten:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Kostenposten wirklich löschen?')) {
      return
    }

    try {
      const response = await fetch(`/api/total-costs?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTotalCosts()
      } else {
        alert('Fehler beim Löschen des Kostenpostens')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Löschen des Kostenpostens')
    }
  }

  useEffect(() => {
    fetchTotalCosts()
    
    const handleUpdate = () => fetchTotalCosts()
    window.addEventListener('totalCostsUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('totalCostsUpdated', handleUpdate)
    }
  }, [])

  if (loading) {
    return <div className="text-center py-4">Lade Gesamtkosten...</div>
  }

  if (totalCosts.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Noch keine Gesamtkosten erfasst</p>
      </div>
    )
  }

  // Group costs by year
  const costsByYear = totalCosts.reduce((acc, cost) => {
    if (!acc[cost.year]) {
      acc[cost.year] = []
    }
    acc[cost.year].push(cost)
    return acc
  }, {} as Record<number, TotalCost[]>)

  return (
    <div className="space-y-6">
      {Object.entries(costsByYear)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, costs]) => (
          <div key={year}>
            <h3 className="text-lg font-semibold mb-4">Jahr {year}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {costs.map((cost) => (
                <Card key={cost.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {costTypeLabels[cost.costType as keyof typeof costTypeLabels]}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cost.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {cost.amount.toFixed(2)} €
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cost.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

interface AdvancePayment {
  id: string
  apartmentId: string
  amount: number
  year: number
  createdAt: string
  updatedAt: string
  apartment: {
    id: string
    apartmentNo: string
    tenantName: string
    house: {
      id: string
      name: string
    }
  }
}

function AdvancePaymentsForm() {
  const [loading, setLoading] = useState(false)
  const [apartments, setApartments] = useState<ApartmentExtended[]>([])
  const [formData, setFormData] = useState({
    apartmentId: '',
    amount: '',
    year: new Date().getFullYear()
  })

  useEffect(() => {
    fetchApartments()
  }, [])

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments')
      if (response.ok) {
        const data = await response.json()
        setApartments(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Wohneinheiten:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/advance-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          apartmentId: '',
          amount: '',
          year: new Date().getFullYear()
        })
        // Trigger refresh of advance payments list
        window.dispatchEvent(new CustomEvent('advancePaymentsUpdated'))
      } else {
        const error = await response.json()
        alert(error.error || 'Fehler beim Speichern der Vorauszahlung')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Speichern der Vorauszahlung')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wohneinheit *
        </label>
        <select
          required
          value={formData.apartmentId}
          onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Wählen Sie eine Wohneinheit</option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              {apartment.house.name} - Wohnung {apartment.apartmentNo} ({apartment.tenantName})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vorauszahlung (€) *
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jahr *
        </label>
        <input
          type="number"
          required
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="md:col-span-3">
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? 'Wird gespeichert...' : 'Vorauszahlung speichern'}
        </Button>
      </div>
    </form>
  )
}

function AdvancePaymentsList() {
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAdvancePayments = async () => {
    try {
      const response = await fetch('/api/advance-payments')
      if (response.ok) {
        const data = await response.json()
        setAdvancePayments(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Vorauszahlungen:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Vorauszahlung wirklich löschen?')) {
      return
    }

    try {
      const response = await fetch(`/api/advance-payments?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAdvancePayments()
      } else {
        alert('Fehler beim Löschen der Vorauszahlung')
      }
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Löschen der Vorauszahlung')
    }
  }

  useEffect(() => {
    fetchAdvancePayments()
    
    const handleUpdate = () => fetchAdvancePayments()
    window.addEventListener('advancePaymentsUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('advancePaymentsUpdated', handleUpdate)
    }
  }, [])

  if (loading) {
    return <div className="text-center py-4">Lade Vorauszahlungen...</div>
  }

  if (advancePayments.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Noch keine Vorauszahlungen erfasst</p>
      </div>
    )
  }

  // Group payments by year
  const paymentsByYear = advancePayments.reduce((acc, payment) => {
    if (!acc[payment.year]) {
      acc[payment.year] = []
    }
    acc[payment.year].push(payment)
    return acc
  }, {} as Record<number, AdvancePayment[]>)

  return (
    <div className="space-y-6">
      {Object.entries(paymentsByYear)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, payments]) => (
          <div key={year}>
            <h3 className="text-lg font-semibold mb-4">Jahr {year}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {payment.apartment.house.name} - Wohnung {payment.apartment.apartmentNo}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                    <CardDescription className="text-xs">
                      {payment.apartment.tenantName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {payment.amount.toFixed(2)} €
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

interface CostAllocationResult {
  apartmentId: string
  apartmentNo: string
  tenantName: string
  houseName: string
  livingArea: number
  totalCosts: number
  advancePayments: number
  balance: number
  costBreakdown: {
    costType: string
    amount: number
    consumption?: number
  }[]
}

function CostAllocationCalculator() {
  const [allocationResults, setAllocationResults] = useState<CostAllocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    houseId: '',
    year: new Date().getFullYear().toString()
  })
  const [houses, setHouses] = useState<House[]>([])

  const costTypeLabels = {
    COLD_WATER: 'Kaltwasser',
    WARM_WATER: 'Warmwasser',
    HEATING: 'Wärmezähler',
    WASHING_MACHINE: 'Waschmaschine',
    INSURANCE: 'Versicherung',
    TAX: 'Steuer',
    CHIMNEY_SWEEPER: 'Kaminfeger'
  }

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      const response = await fetch('/api/houses')
      if (response.ok) {
        const data = await response.json()
        setHouses(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Häuser:', error)
    }
  }

  const calculateCostAllocation = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.houseId) params.append('houseId', filters.houseId)
      if (filters.year) params.append('year', filters.year)

      const response = await fetch(`/api/cost-allocation?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAllocationResults(data)
      }
    } catch (error) {
      console.error('Fehler bei der Kostenanteilsberechnung:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotals = () => {
    return allocationResults.reduce((acc, result) => ({
      totalCosts: acc.totalCosts + result.totalCosts,
      advancePayments: acc.advancePayments + result.advancePayments,
      balance: acc.balance + result.balance
    }), { totalCosts: 0, advancePayments: 0, balance: 0 })
  }

  const totals = getTotals()

  const generatePDF = async () => {
    console.log('PDF generation started')
    if (allocationResults.length === 0) {
      console.log('No allocation results available')
      alert('Bitte erst die Kostenanteile berechnen, bevor Sie eine PDF erstellen.')
      return
    }

    try {
      console.log('Creating PDF with jsPDF...')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Add title
      pdf.setFontSize(20)
      pdf.text('Nebenkostenabrechnung', 20, 30)
      
      // Add year
      pdf.setFontSize(12)
      pdf.text(`Abrechnungsjahr: ${filters.year || new Date().getFullYear()}`, 20, 45)
      
      // Add house filter if selected
      if (filters.houseId) {
        const selectedHouse = houses.find(h => h.id === filters.houseId)
        if (selectedHouse) {
          pdf.text(`Gebäude: ${selectedHouse.name}`, 20, 55)
          if (selectedHouse.address) {
            pdf.text(`Adresse: ${selectedHouse.address}`, 20, 65)
          }
        }
      }
      
      // Add creation date
      pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 75)
      
      // Add totals
      pdf.setFontSize(14)
      pdf.text('Gesamtübersicht:', 20, 95)
      pdf.setFontSize(10)
      pdf.text(`Gesamtkosten aller Wohnungen: ${totals.totalCosts.toFixed(2)} €`, 20, 105)
      pdf.text(`Gesamte Vorauszahlungen: ${totals.advancePayments.toFixed(2)} €`, 20, 115)
      pdf.text(`Gesamtsaldo: ${totals.balance.toFixed(2)} €`, 20, 125)
      
      // Add table header
      let yPosition = 145
      pdf.setFontSize(12)
      pdf.text('Detaillierte Aufschlüsselung:', 20, yPosition)
      yPosition += 15
      
      // Table headers
      pdf.setFontSize(8)
      pdf.text('Haus', 20, yPosition)
      pdf.text('Wohnung', 50, yPosition)
      pdf.text('Mieter', 75, yPosition)
      pdf.text('Fläche', 110, yPosition)
      pdf.text('Kosten', 130, yPosition)
      pdf.text('Vorauszahlung', 155, yPosition)
      pdf.text('Saldo', 180, yPosition)
      yPosition += 10
      
      // Table rows
      allocationResults.forEach((result) => {
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 30
        }
        
        pdf.text(result.houseName, 20, yPosition)
        pdf.text(result.apartmentNo, 50, yPosition)
        pdf.text(result.tenantName, 75, yPosition)
        pdf.text(`${result.livingArea} m²`, 110, yPosition)
        pdf.text(`${result.totalCosts.toFixed(2)} €`, 130, yPosition)
        pdf.text(`${result.advancePayments.toFixed(2)} €`, 155, yPosition)
        pdf.text(`${result.balance.toFixed(2)} €`, 180, yPosition)
        yPosition += 8
      })
      
      // Add detailed breakdown for each apartment
      yPosition += 10
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 30
      }
      
      pdf.setFontSize(12)
      pdf.text('Einzelne Abrechnungen:', 20, yPosition)
      yPosition += 15
      
      allocationResults.forEach((result, index) => {
        if (yPosition > 200) {
          pdf.addPage()
          yPosition = 30
        }
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${result.houseName} - Wohnung ${result.apartmentNo} - ${result.tenantName}`, 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        yPosition += 10
        
        pdf.text(`Wohnfläche: ${result.livingArea} m²`, 25, yPosition)
        yPosition += 8
        pdf.text(`Gesamtkosten: ${result.totalCosts.toFixed(2)} €`, 25, yPosition)
        yPosition += 8
        pdf.text(`Vorauszahlungen: ${result.advancePayments.toFixed(2)} €`, 25, yPosition)
        yPosition += 8
        
        const balanceText = result.balance >= 0 ? 'Guthaben' : 'Nachzahlung'
        const balanceColor = result.balance >= 0 ? 'green' : 'red'
        pdf.text(`Saldo (${balanceText}): ${result.balance.toFixed(2)} €`, 25, yPosition)
        yPosition += 12
        
        // Cost breakdown
        pdf.setFontSize(9)
        pdf.text('Kostenaufschlüsselung:', 25, yPosition)
        yPosition += 8
        
        result.costBreakdown.forEach((cost) => {
          if (yPosition > 270) {
            pdf.addPage()
            yPosition = 30
          }
          
          const costLabel = costTypeLabels[cost.costType as keyof typeof costTypeLabels] || cost.costType
          const consumptionText = cost.consumption ? ` (${cost.consumption} Einheiten)` : ''
          pdf.text(`- ${costLabel}: ${cost.amount.toFixed(2)} €${consumptionText}`, 30, yPosition)
          yPosition += 6
        })
        
        yPosition += 10
      })
      
      // Add footer
      const pageCount = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.text(`Seite ${i} von ${pageCount}`, 180, 285)
        pdf.text('Erstellt mit Nebenkostenabrechnungssystem', 20, 285)
      }
      
      const fileName = `Nebenkostenabrechnung_${filters.year || new Date().getFullYear()}.pdf`
      console.log('Saving PDF with filename:', fileName)
      pdf.save(fileName)
      console.log('PDF saved successfully')
      alert('PDF wurde erfolgreich erstellt!')
    } catch (error) {
      console.error('Fehler bei der PDF-Erstellung:', error)
      alert('Fehler bei der PDF-Erstellung: ' + error.message)
    }
  }

  const generateTenantPDF = async (tenantData: any) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Add title
      pdf.setFontSize(18)
      pdf.text('Nebenkostenabrechnung', 20, 30)
      
      // Add tenant info
      pdf.setFontSize(12)
      pdf.text(`Wohnung: ${tenantData.apartmentNo}`, 20, 50)
      pdf.text(`Mieter: ${tenantData.tenantName}`, 20, 60)
      pdf.text(`Gebäude: ${tenantData.houseName}`, 20, 70)
      pdf.text(`Wohnfläche: ${tenantData.livingArea} m²`, 20, 80)
      
      // Add period
      pdf.text(`Abrechnungsjahr: ${filters.year || new Date().getFullYear()}`, 20, 95)
      pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 105)
      
      // Add summary
      pdf.setFontSize(14)
      pdf.text('Zusammenfassung:', 20, 125)
      pdf.setFontSize(10)
      pdf.text(`Gesamtkosten: ${tenantData.totalCosts.toFixed(2)} €`, 20, 140)
      pdf.text(`Vorauszahlungen: ${tenantData.advancePayments.toFixed(2)} €`, 20, 150)
      
      const balanceText = tenantData.balance >= 0 ? 'Guthaben' : 'Nachzahlung'
      const balanceColor = tenantData.balance >= 0 ? 'green' : 'red'
      pdf.text(`Saldo (${balanceText}): ${tenantData.balance.toFixed(2)} €`, 20, 160)
      
      // Add detailed breakdown
      pdf.setFontSize(12)
      pdf.text('Kostenaufschlüsselung:', 20, 180)
      
      let yPosition = 195
      tenantData.costBreakdown.forEach((cost: any) => {
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 30
        }
        
        const costLabel = costTypeLabels[cost.costType as keyof typeof costTypeLabels] || cost.costType
        const consumptionText = cost.consumption ? ` (${cost.consumption} Einheiten)` : ''
        pdf.text(`${costLabel}: ${cost.amount.toFixed(2)} €${consumptionText}`, 20, yPosition)
        yPosition += 10
      })
      
      // Add payment information
      if (tenantData.balance < 0) {
        yPosition += 10
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 30
        }
        pdf.setFontSize(12)
        pdf.text('Zahlungsinformationen:', 20, yPosition)
        yPosition += 15
        pdf.setFontSize(10)
        pdf.text('Bitte überweisen Sie den ausstehenden Betrag auf folgendes Konto:', 20, yPosition)
        yPosition += 10
        pdf.text('Kontoinhaber: [Ihr Name]', 20, yPosition)
        yPosition += 8
        pdf.text('IBAN: [Ihre IBAN]', 20, yPosition)
        yPosition += 8
        pdf.text('Verwendungszweck: Nebenkosten ' + tenantData.apartmentNo + ' ' + (filters.year || new Date().getFullYear()), 20, yPosition)
      }
      
      // Add footer
      pdf.setFontSize(8)
      pdf.text('Erstellt mit Nebenkostenabrechnungssystem', 20, 285)
      
      const fileName = `Nebenkostenabrechnung_${tenantData.apartmentNo}_${tenantData.tenantName.replace(/\s+/g, '_')}_${filters.year || new Date().getFullYear()}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Fehler bei der PDF-Erstellung:', error)
      alert('Fehler bei der PDF-Erstellung: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Haus
          </label>
          <select
            value={filters.houseId}
            onChange={(e) => setFilters({ ...filters, houseId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Häuser</option>
            {houses.map((house) => (
              <option key={house.id} value={house.id}>
                {house.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jahr
          </label>
          <input
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={calculateCostAllocation} disabled={loading}>
          {loading ? 'Wird berechnet...' : 'Kostenanteile berechnen'}
        </Button>
        {allocationResults.length > 0 && (
          <>
            <Button onClick={generatePDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Gesamt-PDF herunterladen
            </Button>
          </>
        )}
      </div>

      {allocationResults.length > 0 && (
        <div id="cost-allocation-results" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gesamtkosten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {totals.totalCosts.toFixed(2)} €
                </div>
                <p className="text-xs text-muted-foreground">Zu verteilen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vorauszahlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {totals.advancePayments.toFixed(2)} €
                </div>
                <p className="text-xs text-muted-foreground">Eingezahlt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gesamtsaldo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.balance.toFixed(2)} €
                </div>
                <p className="text-xs text-muted-foreground">
                  {totals.balance >= 0 ? 'Guthaben' : 'Nachzahlung'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Haus</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Wohnung</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mieter</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Fläche</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Kosten</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Vorauszahlung</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {allocationResults.map((result) => (
                  <tr key={result.apartmentId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{result.houseName}</td>
                    <td className="border border-gray-300 px-4 py-2">{result.apartmentNo}</td>
                    <td className="border border-gray-300 px-4 py-2">{result.tenantName}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {result.livingArea} m²
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium text-red-600">
                      {result.totalCosts.toFixed(2)} €
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium text-blue-600">
                      {result.advancePayments.toFixed(2)} €
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      result.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.balance.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detaillierte Kostenaufschlüsselung</h3>
            {allocationResults.map((result) => (
              <Card key={result.apartmentId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {result.houseName} - Wohnung {result.apartmentNo} ({result.tenantName})
                    </CardTitle>
                    <Button 
                      onClick={() => generateTenantPDF(result)} 
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF für Mieter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.costBreakdown.map((cost) => (
                      <div key={cost.costType} className="p-3 bg-gray-50 rounded">
                        <div className="font-medium text-sm">
                          {costTypeLabels[cost.costType as keyof typeof costTypeLabels]}
                        </div>
                        <div className="text-lg font-bold text-red-600">
                          {cost.amount.toFixed(2)} €
                        </div>
                        {cost.consumption && (
                          <div className="text-xs text-gray-500">
                            Verbrauch: {cost.consumption.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
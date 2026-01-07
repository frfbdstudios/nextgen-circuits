import { getBrowserSupabaseClient } from './browser'

export interface PopupBanner {
    id: string
    title: string
    image_url: string
    is_active: boolean
    display_order: number
    created_at: string
    updated_at: string
    created_by: string | null
}

export interface CreatePopupBannerInput {
    title: string
    image_url: string
    is_active?: boolean
    display_order?: number
}

export interface UpdatePopupBannerInput {
    title?: string
    image_url?: string
    is_active?: boolean
    display_order?: number
}

class PopupBannerService {
    private supabase = getBrowserSupabaseClient()

    async getBanners(): Promise<PopupBanner[]> {
        const { data, error } = await this.supabase
            .from('popup_banners')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching popup banners:', error)
            return []
        }

        return data || []
    }

    async getActiveBanners(): Promise<PopupBanner[]> {
        const { data, error } = await this.supabase
            .from('popup_banners')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (error) {
            console.error('Error fetching active popup banners:', error)
            return []
        }

        return data || []
    }

    async createBanner(banner: CreatePopupBannerInput): Promise<{ success: boolean; error?: string; data?: PopupBanner }> {
        const { data: { user } } = await this.supabase.auth.getUser()

        const { data, error } = await this.supabase
            .from('popup_banners')
            .insert({
                ...banner,
                created_by: user?.id,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating popup banner:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    }

    async updateBanner(id: string, updates: UpdatePopupBannerInput): Promise<{ success: boolean; error?: string }> {
        const { error } = await this.supabase
            .from('popup_banners')
            .update(updates)
            .eq('id', id)

        if (error) {
            console.error('Error updating popup banner:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    async deleteBanner(id: string): Promise<{ success: boolean; error?: string }> {
        const { error } = await this.supabase
            .from('popup_banners')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting popup banner:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    async toggleBanner(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
        return this.updateBanner(id, { is_active: isActive })
    }

    async uploadBannerImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `banner-${Date.now()}.${fileExt}`
            const filePath = `popup-banners/${fileName}`

            const { error: uploadError } = await this.supabase.storage
                .from('popup-banners')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            console.log("uploading banner image to:", filePath)

            if (uploadError) {
                console.error('Error uploading banner image:', uploadError)
                throw uploadError
            }

            const { data: { publicUrl } } = this.supabase.storage
                .from('popup-banners')
                .getPublicUrl(filePath)

            return { success: true, url: publicUrl }
        } catch (error: any) {
            console.error('Error uploading banner image:', error)
            return { success: false, error: error.message }
        }
    }

    async deleteBannerImage(url: string): Promise<{ success: boolean; error?: string }> {
        try {
            const path = url.split('/').slice(-2).join('/')
            const { error } = await this.supabase.storage
                .from('popup-banners')
                .remove([path])

            if (error) throw error

            return { success: true }
        } catch (error: any) {
            console.error('Error deleting banner image:', error)
            return { success: false, error: error.message }
        }
    }
}

export const popupBannerService = new PopupBannerService()
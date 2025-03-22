
interface Comment {
    id: string
    user_id: string
    listing_id: string
    content: string
    created_at: string
    updated_at: string
    ranking: number
}


interface Listing {
    id: string
    user_id: string
    title: string
    description: string
    image_url: string
    price: number
    created_at: string
    updated_at: string
    area: number
    comments: Comment[]

}
import Link from 'next/link'
import React from 'react'
import { cn } from '~/lib/utils'

export type ListProps = {
    children?: React.ReactNode
    className?: string
}

export type ListTileProps = {
    leading?: React.ReactNode
    trailing?: React.ReactNode
    title?: React.ReactNode
    subtitle?: React.ReactNode
    className?: string
    onClick?: () => void
    href?: string
}

export function List(props: ListProps) {
    const isEmpty = React.Children.count(props.children) === 0

    return (
        <div className={cn(props.className)}>
            {!isEmpty && <ul>{props.children}</ul>}
            {isEmpty && <div className='rounded-lg border border-dashed text-center text-gray-500'>No hay elementos</div>}
        </div>
    )
}

export function ListTile(props: ListTileProps) {
    let content = (
        <>
            {props.leading && <div className='flex shrink-0 items-center justify-center'>{props.leading}</div>}

            <div className='w-full'>
                <div className='flex font-medium'>{props.title}</div>
                <div className='font-semibold text-xs'>{props.subtitle}</div>
            </div>

            {props.trailing && <div className='flex shrink-0 items-center justify-center'>{props.trailing}</div>}
        </>
    )

    const containerClassName = 'flex gap-3 py-3 hover:bg-stone-100 active:bg-stone-200'

    if (props.href) {
        content = (
            <Link href={props.href} className={cn(containerClassName, props.className)} onClick={props.onClick}>
                {content}
            </Link>
        )
    } else {
        content = (
            <div className={cn(containerClassName, props.className)} onClick={props.onClick}>
                {content}
            </div>
        )
    }

    return (
        <li className='border-t last:border-b' role='button' onClick={props.onClick}>
            {content}
        </li>
    )
}

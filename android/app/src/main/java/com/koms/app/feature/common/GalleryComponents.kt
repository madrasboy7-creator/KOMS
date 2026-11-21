package com.koms.app.feature.common

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import com.koms.app.core.database.KomsLocalDb
import com.koms.app.core.design.*
import com.koms.app.core.model.GalleryImage
import com.koms.app.core.model.GalleryItem
import com.koms.app.core.network.KomsApiClient
import kotlinx.coroutines.launch

@Composable
fun GalleryTabContent() {
    val context = LocalContext.current
    val apiClient = remember { KomsApiClient(context) }
    val localDb = remember { KomsLocalDb(context) }
    val coroutineScope = rememberCoroutineScope()

    var selectedCategory by remember { mutableStateOf("All") }
    var currentPage by remember { mutableStateOf(1) }
    val pageSize = 4

    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var galleryItems by remember { mutableStateOf<List<GalleryItem>>(emptyList()) }
    var totalItems by remember { mutableStateOf(0) }
    var totalPages by remember { mutableStateOf(1) }

    var activeDetailItem by remember { mutableStateOf<GalleryItem?>(null) }

    fun loadGalleries(cat: String, page: Int) {
        isLoading = true
        errorMessage = null
        coroutineScope.launch {
            val res = apiClient.getPublicGalleries(cat, page, pageSize)
            if (res.isSuccess) {
                res.getOrNull()?.let { resp ->
                    galleryItems = resp.items
                    totalItems = resp.total
                    totalPages = resp.totalPages
                    currentPage = resp.page
                    isLoading = false
                    // Cache to offline DB
                    localDb.saveGalleries(resp.items)
                }
            } else {
                // Try local DB fallback
                val cached = localDb.getGalleries(cat)
                if (cached.isNotEmpty()) {
                    val fromIdx = (page - 1) * pageSize
                    val toIdx = minOf(fromIdx + pageSize, cached.size)
                    galleryItems = if (fromIdx < cached.size) cached.subList(fromIdx, toIdx) else emptyList()
                    totalItems = cached.size
                    totalPages = maxOf(1, (cached.size + pageSize - 1) / pageSize)
                    isLoading = false
                } else {
                    isLoading = false
                    errorMessage = res.exceptionOrNull()?.message ?: "Failed to load gallery."
                }
            }
        }
    }

    LaunchedEffect(selectedCategory, currentPage) {
        loadGalleries(selectedCategory, currentPage)
    }

    val categories = listOf("All", "Events", "Dojo", "Training", "Achievements")

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DojoDarkBg)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Page Heading
        item {
            Spacer(modifier = Modifier.height(10.dp))
            Column {
                Text(
                    text = "Gallery",
                    color = DojoGold,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "Moments of discipline, strength, and triumph across our Dojos",
                    color = DojoSubtext,
                    fontSize = 12.sp
                )
            }
        }

        // Horizontal Category Filter Section
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                categories.forEach { cat ->
                    val isSelected = selectedCategory.equals(cat, ignoreCase = true)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (isSelected) DojoRed else Color(0xFF141927)
                            )
                            .border(
                                width = 1.dp,
                                color = if (isSelected) DojoRed else Color(0xFF1E283D),
                                shape = RoundedCornerShape(20.dp)
                            )
                            .clickable {
                                if (selectedCategory != cat) {
                                    selectedCategory = cat
                                    currentPage = 1
                                }
                            }
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = cat,
                            color = if (isSelected) Color.White else Color(0xFF9CA3AF),
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Loading Skeleton State
        if (isLoading && galleryItems.isEmpty()) {
            items(4) {
                GalleryCardSkeleton()
            }
        } else if (errorMessage != null && galleryItems.isEmpty()) {
            // Error State
            item {
                GalleryErrorState(
                    message = errorMessage ?: "Unable to fetch gallery.",
                    onRetry = { loadGalleries(selectedCategory, currentPage) }
                )
            }
        } else if (galleryItems.isEmpty()) {
            // Empty State
            item {
                GalleryEmptyState()
            }
        } else {
            // Gallery Cards
            items(galleryItems, key = { it.id }) { item ->
                GalleryCard(
                    item = item,
                    onClick = { activeDetailItem = item }
                )
            }

            // Pagination Controls: ‹ 1 – 4 of 12 ›
            item {
                val startItem = if (totalItems == 0) 0 else ((currentPage - 1) * pageSize) + 1
                val endItem = minOf(currentPage * pageSize, totalItems)

                GalleryPagination(
                    currentPage = currentPage,
                    totalPages = totalPages,
                    startItem = startItem,
                    endItem = endItem,
                    totalItems = totalItems,
                    onPrevPage = {
                        if (currentPage > 1) {
                            currentPage--
                        }
                    },
                    onNextPage = {
                        if (currentPage < totalPages) {
                            currentPage++
                        }
                    }
                )
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }

    // Detail Lightbox Dialog / Image Viewer
    activeDetailItem?.let { item ->
        GalleryDetailViewerDialog(
            item = item,
            onDismiss = { activeDetailItem = null }
        )
    }
}

@Composable
fun GalleryCard(
    item: GalleryItem,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF141927)),
        border = BorderStroke(1.dp, Color(0xFF1E283D)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left Section: Image Preview with counter overlay
            Box(
                modifier = Modifier
                    .size(105.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF0F1420))
            ) {
                SubcomposeAsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(item.coverImage)
                        .crossfade(true)
                        .build(),
                    contentDescription = item.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                    loading = {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color(0xFF1E2638)),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                color = DojoGold,
                                strokeWidth = 2.dp,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    },
                    error = {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color(0xFF1B2233)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Image,
                                contentDescription = null,
                                tint = Color(0xFF4B5563),
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                )

                // Bottom-left image counter overlay
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .background(
                            color = Color(0xCC07090F),
                            shape = RoundedCornerShape(topEnd = 8.dp, bottomStart = 14.dp)
                        )
                        .padding(horizontal = 7.dp, vertical = 3.5.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PhotoCamera,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(11.dp)
                        )
                        Text(
                            text = "1/${maxOf(1, item.imageCount)}",
                            color = Color.White,
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Right Section: Title, Description, Location, Calendar Date, Arrow
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = item.title,
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "View Details",
                        tint = Color(0xFF6B7280),
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = item.description,
                    color = Color(0xFF9CA3AF),
                    fontSize = 12.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Location
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f, fill = false)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = Color(0xFFEF4444), // Red/Pink location icon
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = item.location,
                            color = Color(0xFF9CA3AF),
                            fontSize = 11.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Date
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CalendarMonth,
                            contentDescription = null,
                            tint = Color(0xFFEF4444), // Red/Pink calendar icon
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = item.eventDate,
                            color = Color(0xFF9CA3AF),
                            fontSize = 11.sp,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun GalleryPagination(
    currentPage: Int,
    totalPages: Int,
    startItem: Int,
    endItem: Int,
    totalItems: Int,
    onPrevPage: () -> Unit,
    onNextPage: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Previous Button
        IconButton(
            onClick = onPrevPage,
            enabled = currentPage > 1,
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(if (currentPage > 1) Color(0xFF1E283D) else Color(0xFF141926))
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Previous Page",
                tint = if (currentPage > 1) Color.White else Color(0xFF4B5563),
                modifier = Modifier.size(16.dp)
            )
        }

        Spacer(modifier = Modifier.width(20.dp))

        // Range text: 1 – 4 of 12
        Text(
            text = "$startItem – $endItem of $totalItems",
            color = DojoGold,
            fontSize = 13.5.sp,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.width(20.dp))

        // Next Button
        IconButton(
            onClick = onNextPage,
            enabled = currentPage < totalPages,
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(if (currentPage < totalPages) Color(0xFF1E283D) else Color(0xFF141926))
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Next Page",
                tint = if (currentPage < totalPages) Color.White else Color(0xFF4B5563),
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
fun GalleryDetailViewerDialog(
    item: GalleryItem,
    onDismiss: () -> Unit
) {
    val images = remember(item) {
        if (item.images.isNotEmpty()) item.images else listOf(GalleryImage(id = "c1", imageUrl = item.coverImage))
    }
    val pagerState = rememberPagerState(pageCount = { images.size })
    val coroutineScope = rememberCoroutineScope()

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFF090D18)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .statusBarsPadding()
                    .navigationBarsPadding()
            ) {
                // Top App Bar in Dialog
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF161E30))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Category Tag
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(DojoRed)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = item.category,
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Main Pager Image Area
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxSize()
                    ) { page ->
                        val img = images[page]
                        SubcomposeAsyncImage(
                            model = ImageRequest.Builder(LocalContext.current)
                                .data(img.imageUrl)
                                .crossfade(true)
                                .build(),
                            contentDescription = "${item.title} photo ${page + 1}",
                            contentScale = ContentScale.Fit,
                            modifier = Modifier.fillMaxSize(),
                            loading = {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator(color = DojoGold, strokeWidth = 2.dp)
                                }
                            },
                            error = {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("Image unavailable", color = Color.Gray, fontSize = 12.sp)
                                }
                            }
                        )
                    }

                    // Floating Next / Previous Buttons
                    if (images.size > 1) {
                        // Left Prev Arrow
                        if (pagerState.currentPage > 0) {
                            IconButton(
                                onClick = {
                                    coroutineScope.launch {
                                        pagerState.animateScrollToPage(pagerState.currentPage - 1)
                                    }
                                },
                                modifier = Modifier
                                    .align(Alignment.CenterStart)
                                    .padding(start = 12.dp)
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(Color(0x88000000))
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ChevronLeft,
                                    contentDescription = "Previous Image",
                                    tint = Color.White,
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                        }

                        // Right Next Arrow
                        if (pagerState.currentPage < images.size - 1) {
                            IconButton(
                                onClick = {
                                    coroutineScope.launch {
                                        pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                    }
                                },
                                modifier = Modifier
                                    .align(Alignment.CenterEnd)
                                    .padding(end = 12.dp)
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(Color(0x88000000))
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ChevronRight,
                                    contentDescription = "Next Image",
                                    tint = Color.White,
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                        }
                    }

                    // Floating Counter Badge: 1 / 5
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 12.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xCC0B0E17))
                            .padding(horizontal = 12.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = "${pagerState.currentPage + 1} / ${images.size}",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Thumbnail Strip (if multiple images)
                if (images.size > 1) {
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF0C101D))
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(images.size) { idx ->
                            val isCurrent = pagerState.currentPage == idx
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .border(
                                        width = if (isCurrent) 2.dp else 1.dp,
                                        color = if (isCurrent) DojoGold else Color(0xFF1E283D),
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .clickable {
                                        coroutineScope.launch {
                                            pagerState.animateScrollToPage(idx)
                                        }
                                    }
                            ) {
                                SubcomposeAsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(images[idx].imageUrl)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = null,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                        }
                    }
                }

                // Details Bottom Sheet Info
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF141927))
                        .padding(16.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = item.title,
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = Color(0xFFEF4444),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = item.location,
                                color = Color(0xFF9CA3AF),
                                fontSize = 12.sp
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.CalendarMonth,
                                contentDescription = null,
                                tint = Color(0xFFEF4444),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = item.eventDate,
                                color = Color(0xFF9CA3AF),
                                fontSize = 12.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = item.description,
                        color = Color(0xFFD1D5DB),
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )
                }
            }
        }
    }
}

@Composable
fun GalleryCardSkeleton() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF141927)),
        border = BorderStroke(1.dp, Color(0xFF1E283D))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(105.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF1E2638))
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(18.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF1E2638))
                )
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.9f)
                        .height(14.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF161E2E))
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.5f)
                        .height(14.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF161E2E))
                )
                Spacer(modifier = Modifier.height(10.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.6f)
                        .height(12.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF1E2638))
                )
            }
        }
    }
}

@Composable
fun GalleryEmptyState() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 40.dp, horizontal = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF161E30)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Collections,
                    contentDescription = null,
                    tint = DojoGold,
                    modifier = Modifier.size(32.dp)
                )
            }
            Text(
                text = "No gallery updates available.",
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "New dojo memories and achievements will appear here.",
                color = DojoSubtext,
                fontSize = 12.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun GalleryErrorState(
    message: String,
    onRetry: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 40.dp, horizontal = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                imageVector = Icons.Default.ErrorOutline,
                contentDescription = null,
                tint = DojoRed,
                modifier = Modifier.size(40.dp)
            )
            Text(
                text = "Unable to load gallery",
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = message,
                color = DojoSubtext,
                fontSize = 12.sp,
                textAlign = TextAlign.Center
            )
            Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Retry", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}

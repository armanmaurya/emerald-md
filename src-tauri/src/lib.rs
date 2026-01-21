use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Emitter;
use tauri::Manager;
use tauri::State;

#[derive(Default)]
struct CliArgs {
    file_path: Mutex<Option<String>>,
}

#[tauri::command]
fn show_main_window(window: tauri::Window, cli_args: State<CliArgs>) {
    // Since we no longer have a hardcoded "main" window, show the current window
    let _ = window.show();
    let _ = window.set_focus();

    // Emit file-open event after window is shown
    let file_path = cli_args.file_path.lock().unwrap();
    if let Some(path) = file_path.clone() {
        emit_file_open_event(window.app_handle(), &path);
        // Clear the stored path after emitting
        drop(file_path);
        *cli_args.file_path.lock().unwrap() = None;
    }
}

#[tauri::command]
fn get_cli_args(cli_args: State<CliArgs>) -> bool {
    cli_args.file_path.lock().unwrap().is_some()
}

fn resolve_file_path(file_path: &str) -> String {
    let path = PathBuf::from(file_path);
    if path.is_absolute() {
        file_path.to_string()
    } else {
        // Get the app root directory (one level up from src-tauri)
        std::env::current_dir()
            .ok()
            .map(|cwd| {
                // If current dir is src-tauri, go up one level
                if cwd.ends_with("src-tauri") {
                    cwd.parent().unwrap_or(&cwd).join(&path)
                } else {
                    cwd.join(&path)
                }
            })
            .and_then(|p| p.to_str().map(|s| s.to_string()))
            .unwrap_or_else(|| file_path.to_string())
    }
}

fn emit_file_open_event(app: &tauri::AppHandle, file_path: &str) {
    println!("Emitting file-open event: {}", file_path);
    let _ = app.emit("file-open", file_path);
}

fn spawn_new_window(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let id = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)?
        .as_millis();

    let label = format!("window-{}", id);

    println!("Creating new window with label: {}", label);

    tauri::WebviewWindowBuilder::new(app, label, tauri::WebviewUrl::App("index.html".into()))
        .title("Emerald")
        .inner_size(1000.0, 800.0)
        .decorations(false)
        .visible(false)
        .build()?;

    Ok(())
}

fn handle_file_arg(app: &tauri::AppHandle) -> tauri::Result<()> {
    let args: Vec<String> = std::env::args().collect();

    println!("Total args: {}", args.len());
    for (i, arg) in args.iter().enumerate() {
        println!("Arg[{}]: {}", i, arg);
    }

    // args[0] = exe path
    // args[1] = file opened (if launched from .md double-click)
    if args.len() > 1 && !args[1].is_empty() {
        let file_path = args[1].clone();
        println!("File argument provided: {}", file_path);

        let absolute_path = resolve_file_path(&file_path);
        println!("Resolved path: {}", absolute_path);

        // Check if there are any existing windows
        let windows = app.webview_windows();

        if !windows.is_empty() {
            // Strategy: Try to find a window to handle the file
            // 1. Try focused window first
            // 2. Try visible window
            // 3. Fallback to any window
            let target_window = windows
                .values()
                .find(|w| w.is_focused().unwrap_or(false))
                .or_else(|| windows.values().find(|w| w.is_visible().unwrap_or(false)))
                .or_else(|| windows.values().next());

            if let Some(win) = target_window {
                println!("Found existing window: {}", win.label());
                let _ = win.emit("file-open", &absolute_path);
                let _ = win.set_focus();
            }
        } else {
            println!("No existing windows found, storing path for new window");
            // Store the path for emission after window is shown
            let cli_args: State<CliArgs> = app.state();
            *cli_args.file_path.lock().unwrap() = Some(absolute_path);
        }
    } else {
        println!("No file argument provided");
    }

    Ok(())
}

fn handle_single_instance(app: &tauri::AppHandle, args: Vec<String>, _cwd: String) {
    println!("Single instance event triggered with {} args", args.len());
    for (i, arg) in args.iter().enumerate() {
        println!("Instance Arg[{}]: {}", i, arg);
    }

    // Get all windows
    let windows = app.webview_windows();

    if args.len() > 1 && !args[1].is_empty() {
        let file_path = resolve_file_path(&args[1]);
        println!("Single instance file path: {}", file_path);

        // Strategy: Try to find a window to handle the file
        // 1. Try focused window first
        // 2. Try visible window
        // 3. Fallback to any window
        // 4. Create new if none exist
        let target_window = windows
            .values()
            .find(|w| w.is_focused().unwrap_or(false))
            .or_else(|| windows.values().find(|w| w.is_visible().unwrap_or(false)))
            .or_else(|| windows.values().next());

        if let Some(win) = target_window {
            println!("Emitting to existing window: {}", win.label());
            let _ = win.emit("file-open", &file_path);
            let _ = win.set_focus();
        } else {
            println!("No windows exist, creating new window with file");
            // No windows exist: Create a fresh one with the file in State
            let cli_args: State<CliArgs> = app.state();
            *cli_args.file_path.lock().unwrap() = Some(file_path);
            let _ = spawn_new_window(app);
        }
    } else {
        println!("No windows exist, creating new window");
        let _ = spawn_new_window(app);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        tauri::Builder::default()
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_opener::init())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_prevent_default::init())
            .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
                handle_single_instance(app, args, cwd);
            }))
            .manage(CliArgs::default())
            .invoke_handler(tauri::generate_handler![show_main_window, get_cli_args])
            .setup(|app| {
                handle_file_arg(app.handle())?;

                // Create the initial window
                if let Err(e) = spawn_new_window(app.handle()) {
                    eprintln!("Failed to create initial window: {}", e);
                }

                Ok(())
            })
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    }

    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        tauri::Builder::default()
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_opener::init())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_prevent_default::init())
            .manage(CliArgs::default())
            .invoke_handler(tauri::generate_handler![show_main_window, get_cli_args])
            .setup(|app| {
                handle_file_arg(app.handle())?;

                // Create the initial window
                if let Err(e) = spawn_new_window(app.handle()) {
                    eprintln!("Failed to create initial window: {}", e);
                }

                Ok(())
            })
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    }
}

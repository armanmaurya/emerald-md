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
    window.get_webview_window("main").unwrap().show().unwrap(); // replace "main" by the name of your window
    
    // Emit file-open event after window is shown
    let file_path = cli_args.file_path.lock().unwrap();
    if let Some(path) = file_path.clone() {
        emit_file_open_event(window.app_handle(), &path);
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

        // Store the path for emission after window is shown
        let cli_args: State<CliArgs> = app.state();
        *cli_args.file_path.lock().unwrap() = Some(absolute_path);
    } else {
        println!("No file argument provided");
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("Second instance launched with args: {:?}", args);
            
            // Bring the main window to focus
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
            
            // args[0] = exe path, args[1] = file (if provided)
            if args.len() > 1 && !args[1].is_empty() {
                let file_path = args[1].clone();
                let absolute_path = resolve_file_path(&file_path);
                emit_file_open_event(app, &absolute_path);
            }
        }))
        .plugin(tauri_plugin_prevent_default::init())
        .manage(CliArgs::default())
        .invoke_handler(tauri::generate_handler![show_main_window, get_cli_args])
        .setup(|app| {
            handle_file_arg(app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

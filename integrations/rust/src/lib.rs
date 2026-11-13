use exact_plan::Value;
use exact_runner::{DataError, DataSource};

/// Field order matches `shape Greeting` in app.contract.
#[derive(Debug, PartialEq)]
pub struct Greeting {
    pub label: String,
}
impl Greeting {
    pub fn into_value(self) -> Value {
        Value::record(vec![Value::str(&self.label)])
    }
}
#[derive(Default)]
pub struct Greetings;
impl DataSource for Greetings {
    fn app_id(&self) -> &str { "dev.rightui.example" }
    fn query(&mut self, source: &str, _: &[Value]) -> Result<Value, DataError> {
        match source {
            "greeting" => Ok(Greeting { label: "Hello from Rust".into() }.into_value()),
            _ => Err(DataError::UnknownSource(source.into())),
        }
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn queries_match_the_contract_record_and_reject_unknown_sources() {
        let mut data = Greetings;
        assert_eq!(data.query("greeting", &[]).unwrap(),
            Value::record(vec![Value::str("Hello from Rust")]));
        assert!(matches!(data.query("missing", &[]),
            Err(DataError::UnknownSource(name)) if name == "missing"));
        assert_eq!(data.app_id(), "dev.rightui.example");
    }
}
